import { defineStore } from 'pinia'
import api from '../services/api'

import { EC2Client, DescribeRegionsCommand } from '@aws-sdk/client-ec2'
import { PricingClient, GetProductsCommand } from '@aws-sdk/client-pricing'
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'
import { fetchAuthSession } from 'aws-amplify/auth'
import { amplifyConfig } from '../amplifyConfig'

export type ServiceOption =
  | 'EC2 instances'
  | 'RDS instances'
  | 'Auto Scaling Groups'
  | 'Elastic IPs'
  | 'Buckets S3'
  | 'Elastic Load Balancers'
  | 'Lambda Functions'

export const SERVICE_OPTIONS: ServiceOption[] = [
  'EC2 instances', 'RDS instances', 'Auto Scaling Groups',
  'Elastic IPs', 'Buckets S3', 'Elastic Load Balancers', 'Lambda Functions',
]

// ─── Columnas por servicio ────────────────────────────────────────────────────

export const SERVICE_COLUMNS: Record<ServiceOption, { key: string; label: string; sortable?: boolean }[]> = {
  'EC2 instances': [
    { key: 'Id',          label: 'ID',  sortable: true },
    { key: 'Owner',       label: 'Owner' , sortable: true },
    { key: 'Type',        label: 'Type'  , sortable: true },
    { key: 'State',       label: 'State'  , sortable: true },
    { key: 'Launch time', label: 'Launch Time'  , sortable: true },
  ],
  'RDS instances': [
    { key: 'DBInstanceIdentifierId', label: 'ID', sortable: true},
    { key: 'MasterUsername',         label: 'Owner'  , sortable: true },
    { key: 'DBInstanceClass',        label: 'Type'  , sortable: true },
    { key: 'DBInstanceStatus',       label: 'State'  , sortable: true },
    { key: 'Intance Create Time',    label: 'Created'  , sortable: true },
  ],
  'Auto Scaling Groups': [
    { key: 'AutoScalingGroupName', label: 'Name', sortable: true },
    { key: 'DesiredCapacity',      label: 'Desired'  , sortable: true },
    { key: 'MinSize',              label: 'Min'  , sortable: true },
    { key: 'MaxSize',              label: 'Max'  , sortable: true },
    { key: 'CreatedTime',          label: 'Created'  , sortable: true },
  ],
  'Elastic IPs': [
    { key: 'PublicIp',         label: 'Public IP', sortable: true },
    { key: 'InstanceId',       label: 'Instance ID' , sortable: true },
    { key: 'PrivateIpAddress', label: 'Private IP'  , sortable: true },
  ],
  'Buckets S3': [
    { key: 'Name', label: 'Bucket Name', sortable: true },
  ],
  'Elastic Load Balancers': [
    { key: 'LoadBalancerName', label: 'Name',    sortable: true },
    { key: 'Type',             label: 'Type'  , sortable: true },
    { key: 'State',            label: 'State'  , sortable: true },
    { key: 'CreatedTime',      label: 'Created' , sortable: true },
    { key: 'Region name',      label: 'Region'  , sortable: true },
  ],
  'Lambda Functions': [
    { key: 'FunctionName', label: 'Name',         sortable: true },
    { key: 'Runtime',      label: 'Runtime'  , sortable: true },
    { key: 'CodeSize',     label: 'Code Size'  , sortable: true },
    { key: 'MemorySize',   label: 'Memory (MB)'  , sortable: true },
    { key: 'LastModified', label: 'Last Modified'  , sortable: true },
  ],
}

const ENDPOINT_MAP: Record<ServiceOption, string> = {
  'EC2 instances':          'AllInstancesEC2',
  'RDS instances':          'AllInstancesRDS',
  'Auto Scaling Groups':    'AutoScalingGroups',
  'Elastic IPs':            'ElasticIP',
  'Buckets S3':             'AllBuckets',
  'Elastic Load Balancers': 'ElasticLoadBalancing',
  'Lambda Functions':       'Lambda',
}

// ─── Conversión código región → nombre largo para Pricing API ─────────────────
// La AWS Pricing API exige el nombre largo ("US East (N. Virginia)") como filtro
// de location. El backend puede enviar el código corto ("us-east-1") o el nombre
// largo directamente.

const REGION_TO_LOCATION: Record<string, string> = {
  'us-east-1':      'US East (N. Virginia)',
  'us-east-2':      'US East (Ohio)',
  'us-west-1':      'US West (N. California)',
  'us-west-2':      'US West (Oregon)',
  'eu-west-1':      'EU (Ireland)',
  'eu-west-2':      'EU (London)',
  'eu-west-3':      'EU (Paris)',
  'eu-central-1':   'EU (Frankfurt)',
  'eu-north-1':     'EU (Stockholm)',
  'ap-southeast-1': 'Asia Pacific (Singapore)',
  'ap-southeast-2': 'Asia Pacific (Sydney)',
  'ap-northeast-1': 'Asia Pacific (Tokyo)',
  'ap-northeast-2': 'Asia Pacific (Seoul)',
  'ap-south-1':     'Asia Pacific (Mumbai)',
  'sa-east-1':      'South America (Sao Paulo)',
  'ca-central-1':   'Canada (Central)',
}

/**
 * Convierte el campo 'Region name' del backend al nombre largo que requiere
 * la Pricing API. Si ya es el nombre largo (contiene paréntesis), lo devuelve
 * tal cual. Si es un código corto (ej. "us-east-1"), lo convierte.
 */
function toLocationDescription(regionName: string): string {
  if (!regionName) return ''
  if (regionName.includes('(') || regionName.includes(' ')) return regionName
  return REGION_TO_LOCATION[regionName] ?? regionName
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function isEc2Running(item: any): boolean {
  const rawState = item?.State?.Name ?? item?.State ?? item?.InstanceState?.Name
  return String(rawState ?? '').trim().toLowerCase() === 'running'
}

function isElasticIpUnattached(item: any): boolean {
  const hasDirectInstance = hasValue(item?.InstanceId)
  return !hasDirectInstance
}

function applyServiceItemFilter(items: any[], serviceKey: string): any[] {
  if (serviceKey === 'ec2') {
    return items.filter(isEc2Running)
  }
  if (serviceKey === 'elasticIP') {
    return items.filter(isElasticIpUnattached)
  }
  return items
}

function applyServiceItemFilterByName(items: any[], service: ServiceOption): any[] {
  if (service === 'EC2 instances') {
    return items.filter(isEc2Running)
  }
  if (service === 'Elastic IPs') {
    return items.filter(isElasticIpUnattached)
  }
  return items
}


const REGIONS_CACHE_KEY = 'EC2 instances_regions'

const FALLBACK_REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-central-1',
]

let cachedCredentialsProvider: any = null

async function getV3Credentials() {
  if (cachedCredentialsProvider) return cachedCredentialsProvider
  try {
    const session = await fetchAuthSession()
    const token   = session.tokens?.idToken?.toString()
    if (!token) {
      console.warn('[Oteador] No se encontró idToken en la sesión de Amplify')
      return undefined
    }
    const region         = amplifyConfig.Auth.Cognito.region
    const userPoolId     = amplifyConfig.Auth.Cognito.userPoolId
    const identityPoolId = amplifyConfig.Auth.Cognito.identityPoolId
    const providerName   = `cognito-idp.${region}.amazonaws.com/${userPoolId}`

    cachedCredentialsProvider = fromCognitoIdentityPool({
      identityPoolId,
      logins: { [providerName]: token },
      clientConfig: { region },
    })
    return cachedCredentialsProvider
  } catch (e) {
    console.error('[Oteador] Error obteniendo credenciales:', e)
    return undefined
  }
}

export function clearCredentialCache() {
  cachedCredentialsProvider = null
}

// ─── Helper: extrae precio OnDemand USD de un item de PriceList ───────────────

function extractOnDemandPrice(priceListItem: any): number {
  try {
    let raw = priceListItem;
    // Aseguramos que trabajamos con un string para el parseo inicial
    if (typeof raw !== 'string') raw = JSON.stringify(raw);
    
    let parsed = JSON.parse(raw);
    // Doble parseo: el SDK v3 a veces devuelve el objeto como un string escapado
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);

    const terms = parsed?.terms?.OnDemand || parsed?.Terms?.OnDemand;
    if (!terms) return 0;

    const firstOffer = Object.values(terms)[0] as any;
    if (!firstOffer?.priceDimensions) return 0;

    // Buscamos el Tier 1 (beginRange: "0") para evitar precios de volumen (Tier 2/3)
    const dimensions = Object.values(firstOffer.priceDimensions) as any[];
    const tier1 = dimensions.find(d => d.beginRange === "0") || dimensions[0];
    
    const priceStr = tier1?.pricePerUnit?.USD || tier1?.pricePerUnit?.usd || "0";
    return Number(priceStr);
  } catch (error) {
    console.error('[Oteador] Error crítico en extracción:', error);
    return 0;
  }
}
// ─── Helper: reintento con backoff para errores 504 ──────────────────────────
// Reintenta la función hasta maxRetries veces si recibe un 504 (timeout Lambda).
// Espera delayMs * intento antes de cada reintento.

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 1,
  delayMs = 0,
): Promise<T> {
  let lastError: any
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const status = error?.response?.status ?? error?.status
      const is504  = status === 504 || error?.message?.includes('504')
      if (!is504 || attempt === maxRetries) throw error
      console.warn(`[Oteador] 504 en región (intento ${attempt}/${maxRetries}), reintentando...`)
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      lastError = error
    }
  }
  throw lastError
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useOteadorStore = defineStore('oteador', {
  state: () => ({
    selectedService:  'EC2 instances' as ServiceOption,
    selectedRegion:   'us-east-1',
    availableRegions: ['us-east-1'],
    items:            [] as any[],
    allRegionItems:   [] as any[],  // items de todas las regiones (modo widget click)
    widgetServiceFilter: '' as string, // servicio activo por click en widget ('ec2','rds'...)
    globalMetrics: {
      ec2: 0, rds: 0, autoscaling: 0, elb: 0, elasticIP: 0, lambda: 0,
    } as Record<string, number>,
    prices: {
      ec2: 0, rds: 0, autoscaling: null, elb: 0, elasticIP: null, lambda: 0,
    } as Record<string, number | null>,
    loadingService: false,
    loadingInitial: true,
  }),

  getters: {
    chartData: (state) => {
      const counts = state.items.reduce((acc: Record<string, number>, item) => {
        const key = state.selectedService === 'Elastic Load Balancers'
          ? (item.Type  || 'unknown')
          : (item.State || 'unknown')
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      return {
        labels: Object.keys(counts),
        datasets: [{
          label: '#Services',
          data: Object.values(counts),
          backgroundColor: 'rgba(74,227,135,0.2)',
          borderColor: 'rgba(0,102,0,1)',
          borderWidth: 1,
        }],
      }
    },

    chartXAxis: (state) => {
      if (state.selectedService === 'Elastic Load Balancers') return 'Types'
      if (['Auto Scaling Groups', 'Elastic IPs', 'Buckets S3'].includes(state.selectedService)) return 'Number'
      return 'States'
    },

    currentColumns: (state) => SERVICE_COLUMNS[state.selectedService],
  },

  actions: {
    setSelectedService(service: ServiceOption) { this.selectedService = service },
    setSelectedRegion(region: string)           { this.selectedRegion  = region  },
    setAvailableRegions(regions: string[])      { this.availableRegions = regions },
    setLoadingService(v: boolean)               { this.loadingService  = v       },
    setLoadingInitial(v: boolean)               { this.loadingInitial  = v       },
    setWidgetServiceFilter(key: string)          { this.widgetServiceFilter = key  },

    // ── fetchRegions ───────────────────────────────────────────────────────

    async fetchRegions() {
      const cached = window.localStorage.getItem(REGIONS_CACHE_KEY)
      if (cached) {
        this.setAvailableRegions(JSON.parse(cached))
        return
      }
      const credentials = await getV3Credentials()
      if (!credentials) {
        console.warn('[Oteador] fetchRegions: sin credenciales, usando fallback')
        this.setAvailableRegions(FALLBACK_REGIONS)
        return
      }
      try {
        const client   = new EC2Client({ region: 'us-east-1', credentials })
        const response = await client.send(new DescribeRegionsCommand({}))
        const regions  = (response.Regions ?? [])
          .map(r => r.RegionName!)
          .filter(Boolean)
          .sort()
        this.setAvailableRegions(regions)
        window.localStorage.setItem(REGIONS_CACHE_KEY, JSON.stringify(regions))
      } catch (error) {
        console.error('[Oteador] fetchRegions error:', error)
        this.setAvailableRegions(FALLBACK_REGIONS)
      }
    },

    // ── calculatePrices ────────────────────────────────────────────────────

    async calculatePrices(summary: Record<string, any>) {
      const credentials = await getV3Credentials()
      if (!credentials) {
        console.warn('[Oteador] calculatePrices: sin credenciales, precios quedan en 0')
        return
      }

      const client    = new PricingClient({ region: 'us-east-1', credentials })
      const newPrices: Record<string, number | null> = {
        ec2: 0, rds: 0, autoscaling: null, elb: 0, elasticIP: null, lambda: 0,
      }

      const cacheGet = (key: string): number | null => {
        const v = window.localStorage.getItem(key)
        if (!v) return null
        const price = JSON.parse(v).price as number
        return price > 0 ? price : null
      }
       const cacheSet = (key: string, price: number) => {
         if (price > 0) window.localStorage.setItem(key, JSON.stringify({ price }))
       }

      const promises: Promise<{ service: string; price: number }>[] = []

      // ── EC2 ──────────────────────────────────────────────────────────────
      const ec2Info = summary.ec2?.info ?? []

      const ec2Groups: Record<string, { location: string; count: number }> = {}
      for (const inst of ec2Info) {
        const location = toLocationDescription(inst['Region name']).trim()
        const key      = `${inst['Type']}_${location}`
        if (!ec2Groups[key]) ec2Groups[key] = { location, count: 0 }
        ec2Groups[key].count++
      }
      for (const [key, { location, count }] of Object.entries(ec2Groups)) {
        const instanceType = key.split('_')[0]
        const cacheKey     = `ec2price_${key}`
        const cached       = cacheGet(cacheKey)
        if (cached !== null) {
          promises.push(Promise.resolve({ service: 'ec2', price: cached * count }))
        } else {
          promises.push(
            client.send(new GetProductsCommand({
              ServiceCode: 'AmazonEC2', FormatVersion: 'aws_v1', MaxResults: 1,
              Filters: [
                { Type: 'TERM_MATCH', Field: 'instanceType',    Value: instanceType },
                { Type: 'TERM_MATCH', Field: 'location',        Value: location },
                { Type: 'TERM_MATCH', Field: 'operatingSystem', Value: 'Linux' },
                { Type: 'TERM_MATCH', Field: 'tenancy',         Value: 'Shared' },
                { Type: 'TERM_MATCH', Field: 'capacitystatus',  Value: 'Used' },
                { Type: 'TERM_MATCH', Field: 'preInstalledSw',  Value: 'NA' },
              ],
            
            })).then(res => {
        
                let raw = res.PriceList?.[0]
              if (typeof raw !== 'string') raw = JSON.stringify(raw)
              let obj = JSON.parse(raw)
              if (typeof obj === 'string') obj = JSON.parse(obj)
              const price = extractOnDemandPrice(res.PriceList?.[0])
              // cacheSet(cacheKey, price)
              return { service: 'ec2', price: price * count }
            }).catch(err => {
              console.error(`[Oteador] EC2 pricing error (${instanceType} @ ${location}):`, err)
              return { service: 'ec2', price: 0 }
            }),
          )
        }
      }

      // ── RDS ──────────────────────────────────────────────────────────────
      const rdsInfo = summary.rds?.info ?? []
      const rdsGroups: Record<string, { location: string; count: number }> = {}
      for (const inst of rdsInfo) {
        const location = toLocationDescription(inst['Region name']).trim()
        const key      = `${inst['DBInstanceClass']}_${location}`
        if (!rdsGroups[key]) rdsGroups[key] = { location, count: 0 }
        rdsGroups[key].count++
      }
      for (const [key, { location, count }] of Object.entries(rdsGroups)) {
        const instanceType = key.split('_')[0]
        const cacheKey     = `rdsprice_${key}`
        const cached       = cacheGet(cacheKey)
        if (cached !== null) {
          promises.push(Promise.resolve({ service: 'rds', price: cached * count }))
        } else {
          promises.push(
            client.send(new GetProductsCommand({
              ServiceCode: 'AmazonRDS', FormatVersion: 'aws_v1', MaxResults: 1,
              Filters: [
                { Type: 'TERM_MATCH', Field: 'instanceType',   Value: instanceType },
                { Type: 'TERM_MATCH', Field: 'location',       Value: location },
                { Type: 'TERM_MATCH', Field: 'databaseEngine', Value: 'MySQL' },
              ],
            })).then(res => {
              const price = extractOnDemandPrice(res.PriceList?.[0])
              cacheSet(cacheKey, price)
              return { service: 'rds', price: price * count }
            }).catch(err => {
              console.error(`[Oteador] RDS pricing error (${instanceType} @ ${location}):`, err)
              return { service: 'rds', price: 0 }
            }),
          )
        }
      }

      // ── ELB ──────────────────────────────────────────────────────────────
      const elbOperationMap: Record<string, string> = {
        classic:     'LoadBalancing',
        application: 'LoadBalancing:Application',
        network:     'LoadBalancing:Network',
      }
      const elbInfo = summary.elb?.info ?? []
      const elbGroups: Record<string, { location: string; type: string; count: number }> = {}
      for (const inst of elbInfo) {
        const location = toLocationDescription(inst['Region name']).trim()
        const key      = `${inst['Type']}_${location}`
        if (!elbGroups[key]) elbGroups[key] = { location, type: inst['Type'], count: 0 }
        elbGroups[key].count++
      }
      for (const [key, { location, type, count }] of Object.entries(elbGroups)) {
        const cacheKey  = `elbprice_${key}`
        const cached    = cacheGet(cacheKey)
        const operation = elbOperationMap[type?.toLowerCase()] ?? 'LoadBalancing'
        if (cached !== null) {
          promises.push(Promise.resolve({ service: 'elb', price: cached * count }))
        } else {
          promises.push(
            client.send(new GetProductsCommand({
              ServiceCode: 'AWSELB', FormatVersion: 'aws_v1', MaxResults: 1,
              Filters: [
                { Type: 'TERM_MATCH', Field: 'location',  Value: location },
                { Type: 'TERM_MATCH', Field: 'usagetype', Value: 'LoadBalancerUsage' },
                { Type: 'TERM_MATCH', Field: 'operation', Value: operation },
              ],
            })).then(res => {
              const price = extractOnDemandPrice(res.PriceList?.[0])
              cacheSet(cacheKey, price)
              return { service: 'elb', price: price * count }
            }).catch(err => {
              console.error(`[Oteador] ELB pricing error (${type} @ ${location}):`, err)
              return { service: 'elb', price: 0 }
            }),
          )
        }
      }

      // ── Lambda ────────────────────────────────────────────────────────────
      const lambdaInfo = summary.lamb?.info ?? []
      const lambdaGroups: Record<string, { location: string; memorySize: number; count: number }> = {}
      for (const inst of lambdaInfo) {
        const location = toLocationDescription(inst['Region name']).trim()
        const key      = `${inst['MemorySize']}_${location}`
        if (!lambdaGroups[key]) lambdaGroups[key] = { location, memorySize: inst['MemorySize'], count: 0 }
        lambdaGroups[key].count++
      }
      for (const [key, { location, memorySize, count }] of Object.entries(lambdaGroups)) {
        const cacheKey = `lambdaprice_${key}`
        const cached   = cacheGet(cacheKey)
        if (cached !== null) {
          promises.push(Promise.resolve({ service: 'lambda', price: cached * count }))
        } else {
          promises.push(
            client.send(new GetProductsCommand({
              ServiceCode: 'AWSLambda', FormatVersion: 'aws_v1', MaxResults: 1,
              Filters: [
                { Type: 'TERM_MATCH', Field: 'location',  Value: location },
                { Type: 'TERM_MATCH', Field: 'usagetype', Value: 'Lambda-GB-Second' },
              ],
            })).then(res => {
              const pricePerUnit = extractOnDemandPrice(res.PriceList?.[0])
              const price        = (memorySize / 1024) * pricePerUnit
               cacheSet(cacheKey, price)
              return { service: 'lambda', price: price * count }
            }).catch(err => {
              return { service: 'lambda', price: 0 }
            }),
          )
        }
      }

      // Acumular resultados
      const results = await Promise.allSettled(promises)
      results.forEach(res => {
        if (res.status === 'fulfilled') {
          const currentPrice = newPrices[res.value.service]
          if (typeof currentPrice === 'number') {
            newPrices[res.value.service] = currentPrice + res.value.price
          }
        }
      })
      this.prices = newPrices
    },

    // ── fetchGlobalData ────────────────────────────────────────────────────
    // Llama a TODAS las regiones. Solo se ejecuta en el mount inicial.
    // Actualiza widgets (métricas + precios) y precarga allRegionItems.

    async fetchGlobalData() {
      this.setLoadingService(true)
      try {
        // El endpoint services/region/{r} devuelve un array plano de EC2,
        // no un resumen por servicio. Por eso usamos los endpoints específicos
        // de cada servicio en paralelo sobre todas las regiones.
        const serviceEndpoints: Record<string, string> = {
          ec2:        'AllInstancesEC2',
          rds:        'AllInstancesRDS',
          autoscaling:'AutoScalingGroups',
          elb:        'ElasticLoadBalancing',
          elasticIP:  'ElasticIP',
          lambda:     'Lambda',
        }

        const globalMetrics: Record<string, number> = {
          ec2: 0, rds: 0, autoscaling: 0, elb: 0, elasticIP: 0, lambda: 0,
        }
        const combinedSummary: Record<string, { number: number; info: any[] }> = {
          ec2:        { number: 0, info: [] },
          rds:        { number: 0, info: [] },
          autoscaling:{ number: 0, info: [] },
          elb:        { number: 0, info: [] },
          elasticIP:  { number: 0, info: [] },
          lamb:       { number: 0, info: [] },
        }

        // Para cada servicio, pedimos todas las regiones en paralelo
        const serviceKeys = Object.keys(serviceEndpoints)
        const allFetches = serviceKeys.flatMap(serviceKey =>
          this.availableRegions.map(r => ({
            serviceKey,
            region: r,
            promise: withRetry(() =>
              api.oteadorClient.get(`services/${serviceEndpoints[serviceKey]}/region/${r}`)
            ),
          }))
        )

        const results = await Promise.allSettled(allFetches.map(f => f.promise))

        results.forEach((result, i) => {
          const { serviceKey, region } = allFetches[i]
          if (result.status !== 'fulfilled') {
            console.warn(`[Oteador] ✗ ${serviceKey}/${region}:`,
              (result.reason as any)?.response?.status ?? result.reason)
            return
          }

          let items: any[] = result.value.data ?? []
          if (!Array.isArray(items)) items = []
          items = applyServiceItemFilter(items, serviceKey)

          // Buckets S3: el backend devuelve strings, normalizamos
          if (serviceKey === 'ec2' /* placeholder, S3 se añadiría aquí */) {
            items = items.map(i => typeof i === 'string' ? { Name: i } : i)
          }

          globalMetrics[serviceKey] += items.length

          // combinedSummary usa 'lamb' para lambda (clave legacy de calculatePrices)
          const summaryKey = serviceKey === 'lambda' ? 'lamb' : serviceKey
          combinedSummary[summaryKey].number += items.length
          combinedSummary[summaryKey].info.push(...items)
        })

        this.globalMetrics = { ...globalMetrics }
        await this.calculatePrices(combinedSummary)
        await this.fetchTableData()

      } catch (error) {
        console.error('[Oteador] fetchGlobalData error:', error)
      } finally {
        this.setLoadingService(false)
        this.setLoadingInitial(false)
      }
    },

    // ── fetchTableData ─────────────────────────────────────────────────────
    // Carga solo los items de la región seleccionada para la tabla.
    // Se llama al cambiar de región o servicio.

    async fetchTableData() {
      this.setLoadingService(true)
      try {
        this.setWidgetServiceFilter('')  // resetear modo widget al cambiar región/servicio
        const endpoint = ENDPOINT_MAP[this.selectedService]
        const { data: detail } = await withRetry(() =>
          api.oteadorClient.get(`services/${endpoint}/region/${this.selectedRegion}`)
        )
        const normalized = this.selectedService === 'Buckets S3'
          ? (detail as any[]).map(item => (typeof item === 'string' ? { Name: item } : item))
          : (detail as any[])
        this.items = applyServiceItemFilterByName(normalized, this.selectedService)
        this.allRegionItems = []
      } catch (error) {
        console.error('[Oteador] fetchTableData error:', error)
      } finally {
        this.setLoadingService(false)
      }
    },

    // ── fetchAllRegionItems ────────────────────────────────────────────────
    // Al hacer click en un widget, carga los items de ESE servicio en
    // TODAS las regiones y los muestra en la tabla.

    async fetchAllRegionItems(serviceKey: string) {
      const keyToService: Record<string, ServiceOption> = {
        ec2:        'EC2 instances',
        rds:        'RDS instances',
        autoscaling:'Auto Scaling Groups',
        elasticIP:  'Elastic IPs',
        elb:        'Elastic Load Balancers',
        lambda:     'Lambda Functions',
      }
      const service = keyToService[serviceKey]
      if (!service) return

      this.setLoadingService(true)
      this.setWidgetServiceFilter(serviceKey)
      this.setSelectedService(service)

      try {
        const endpoint = ENDPOINT_MAP[service]
        const regionResults = await Promise.allSettled(
          this.availableRegions.map(r =>
            withRetry(() => api.oteadorClient.get(`services/${endpoint}/region/${r}`))
          )
        )

        const allItems: any[] = []
        regionResults.forEach(result => {
          if (result.status !== 'fulfilled') return
          const detail = result.value.data
          const normalized = service === 'Buckets S3'
            ? (detail as any[]).map(item => (typeof item === 'string' ? { Name: item } : item))
            : (detail as any[])
          allItems.push(...applyServiceItemFilterByName(normalized, service))
        })

        this.allRegionItems = allItems
        this.items = allItems
      } catch (error) {
        console.error('[Oteador] fetchAllRegionItems error:', error)
      } finally {
        this.setLoadingService(false)
      }
    },
    async fetchAllData() {
      await this.fetchGlobalData()
    },
  },
})