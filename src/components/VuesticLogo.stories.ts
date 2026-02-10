import VuesticLogo from './VuesticLogo.vue'

export default {
  title: 'VuesticLogo',
  component: VuesticLogo,
  tags: ['autodocs'],
}

export const Default = () => ({
  components: { VuesticLogo },
  template: `<VuesticLogo start="#6bfeadff" end="#08c677ff" />`,
})

export const White = () => ({
  components: { VuesticLogo },
  template: `<div class="bg-primary">
    <VuesticLogo start="#FFF"/>
  </div>`,
})

export const Blue = () => ({
  components: { VuesticLogo },
  template: `<VuesticLogo start="#11b38aff"/>`,
})

export const Height = () => ({
  components: { VuesticLogo },
  template: `<VuesticLogo start="#8dfe6bff" end="#08c667ff" :height="48"/>`,
})
