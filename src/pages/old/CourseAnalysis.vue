<template>
  <div class="courseAnalysis">
		<vuestic-widget class="no-padding no-v-padding">
			<div class="row" style="padding-top:40px;">
				<div class="col-12 col-md-5 col-lg-4" style="margin-top:10px;">
					<v-select
					v-model="selected_course"
					label="label"
					:options="courseOptions"
					placeholder="Courses"
					@input="onCourseSelected"
					/>
				</div>
				<div v-show="show_dates" class="col-12 col-md-4 col-lg-4" style="margin-top:10px;">
					<div class="input-group mb-3">
						<div class="input-group-prepend">
							<span class="input-group-text" id="basic-addon1"><i class="fas fa-calendar-alt"></i></span>
						</div>
						<input id="date-range" type="text" class="form-control text-center" aria-label="dates" aria-describedby="basic-addon1"
						style="border: 1px solid rgba(60,60,60,.26);">
					</div>
				</div>
				<div class="row col-12 col-md-3 col-lg-4">
					<fieldset class="col-6" style="padding-top:15px; padding-right:10px;">
						<vuestic-checkbox
						label="Dates"
						:id="'checkbox'"
						v-model="show_dates"/>
					</fieldset>

					<button class="btn btn-primary" @click="onSearch()" :disabled="processing || !selected_course || !selected_course.label" style="padding: 0.8rem 1.0rem!important;letter-spacing: normal;">
					<i v-if="processing" class="fas fa-spinner fa-pulse"></i><i v-if="!processing" class="fas fa-search d-lg-none" ></i><span v-if="!processing" class="d-none d-lg-block">Search</span></button>
				</div>
			</div> 
			<div style="margin-top:10px;">
				<div class="input-group mb-3">
					<label style="margin-right:10px;">User range</label>
					<input
						type="number"
						placeholder="min"
						style="margin-right:10px; width:80px"
						v-model.number="min_user"
						@keypress="onlyNumbers"
 						@input="min_user = Math.min(300, Math.max(0, min_user))"
					/>
					<input
						type="number"
						placeholder="max"
						style="width:80px"
						v-model.number="max_user"
						@keypress="onlyNumbers"
						@input="min_user = Math.min(300, Math.max(0, min_user))"
					/>
				</div>
			</div>
			<div v-show="showDiv">
				<div class="row" style="padding-top:40px; padding-bottom:40px;">
					<div class="col-12 col-md-5 col-lg-4" style="margin-top:10px;">
					<button class="btn btn-primary" @click="descargarPDF()" :disabled="processing || !selected_course || !selected_course.label" style="padding: 0.8rem 1.0rem!important;letter-spacing: normal;">
					<i v-if="processing" class="fas fa-spinner fa-pulse"></i><i v-if="!processing" class="fas fa-search d-lg-none" ></i><span v-if="!processing" class="d-none d-lg-block">Generar PDF</span></button>
					</div>
					<div  class="col-12" style="margin-top:20px;padding-left:0;padding-right:0;">
						<h3>Average percentage of compliance with the laboratory practices of the course {{ aux_selected_course && aux_selected_course.label ? aux_selected_course.label : "" }}</h3>
						<div style="position: relative; height:50vh;" id="canva">
							<canvas id="myChart"></canvas>
				  		</div>
			   		</div>
				</div>
			</div>
			<div v-show="graphData.length > 0" class="row" style="margin-bottom:40px;">
					<div id="accordion-search" class="col-md-12">
						<div>
							<div id="headingOne" style="padding-bottom:20px;">
								<h5 class="mb-0">
								<button class="btn btn-primary" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne"
								style="padding: 0.8rem 1.0rem!important;letter-spacing: normal;">
									Details
								</button>
								</h5>
							</div>

							<div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#accordion-search" background-color="lightblue" >
								<div class="card-body col-12">
									<table id="table-details" class="stripe" style="width:100%">
									</table>
							</div>
							
						</div>
						<div v-for="user in Object.keys(percentMap)" :key="user" class="user-chart-container mb-4">
								<div v-if="aux_min_user !== aux_max_user" class="pdf-margin-top">
									<h4>{{ user }}</h4>
									<div style="position: relative; height:40vh;">
										<canvas :id="'chart-' + user"></canvas>
									</div>
								</div>
							</div>
					</div>
				</div>
			</div>
		</vuestic-widget>
	</div>
</template>

<script>
import vSelect from "vue-select";
import JsonExcel from 'vue-json-excel';
import api from "../../api.js";
import envprac from "../../envprac.js"
import Axios from "axios";
import {searchEC2} from "./CourseCostAnalysis.js"
import {CognitoIdentityCredentials} from 'aws-sdk'
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import { generarPDFConGraficos } from './pdfgenerator.js'
import Chart from 'chart.js';

export default {
	name: "courseanalysis",
	components: {
		//"course-cost-analysis": CourseCostAnalysis,
		"v-select": vSelect,
		'downloadExcel': JsonExcel,
	}, 
    data() {
		return {
			json_data: [],
			range: [0, 220],
			graphData2: [],
			options: [],
			all_users: [],
			all_data: [],
			initData:[],
			referData:[],
			progressMilestones: {},
			graphData: [],
			res : [],
			all_services: {},
      		all_courses: [],
			percentMap: {},
			allResponses: [],
			user_name: "",
			start_date: "", 
			end_date: "",
			table: "",
			activeBars: "",
			datepicker:{
				range:''
			},
			showDiv: false,
			show_dates: true,
			select_subject: false,
			no_result: false,
			processing: false,
			selected_course: null,
			aux_selected_course: null,	
			validated: 0,
			max: 0,
			expenses: 0,
			min_user: "0",
			max_user: "1",
			aux_min_user: "",
			aux_max_user: "",
			token: "Loading token..",
			courseOptions: [
			 { label: 'CursoCloudAWS', value: 'option1', practices:["PL_EC2", "PL_EC2_S3", "PL_RDS",  "PL_DYNAMODB",  "PL_APP", "PL_CF", "PL_VPC", "PL_LAMBDA_SQS", "PL_SERVERLESS_APP"], expenses:0},
			 { label: 'MBDA-CGDNGB', value: 'option2', practices:  ["PL_EC2", "PL_EC2_S3", "PL_RDS", "PL_APP", "PL_LAMBDA_SQS"] , expenses:0},
			 { label: 'MBDA-MEGBD', value: 'option3', practices: ["PL_EMR"] , expenses:0},
			 { label: 'MUCNAP-ICP', value: 'option4', practices: ["PL_EC2", "PL_EC2_S3", "PL_VPC", "PL_RDS", "PL_DYNAMODB", "PL_APP", "PL_CF", "PL_LAMBDA_SQS"] , expenses:0},
			 { label: 'MUCNAP-CBD', value: 'option5', practices:  ["PL_EMR"] , expenses:0},
			 { label: 'MUGI-SEN', value: 'option6', practices: ["PL_EC2", "PL_EC2_S3", "PL_RDS", "PL_DYNAMODB", "PL_APP", "PL_CF", "PL_CF", "PL_LAMBDA_SQS"], expenses:0},
			 { label: 'GII-LPP', value: 'option7', practices:  ["PL_EC2", "PL_EC2_S3"] , expenses:0},
			 { label: 'GCD-IPD', value: 'option8', practices: ["PL_EC2", "PL_EC2_S3"] , expenses:0},
			 { label: 'MUCC-DDS', value: 'option9', practices: ["PL_EC2", "PL_EC2_S3", "PL_VPC", "PL_RDS", "PL_APP", "PL_CF", "PL_LAMBDA_SQS"], expenses:0},
			 { label: 'MUIS-DOS', value: 'option10', practices: ["PL_EC2", "PL_CF", "PL_LAMBDA_SQS"]  , expenses:0},
			 { label: 'TCC', value: 'option11' , practices:  ["PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"], expenses:0},
			],
		};
  	},
	methods: {
		async onSearch() {
			try {
				this.processing = true;
				this.graphData = [];
				this.all_services = {};
				this.allResponses = [];
				this.aux_selected_course = { ...this.selected_course };
				const minUserNum = Number(this.min_user);
				const maxUserNum = Number(this.max_user);
				this.aux_min_user = Math.min(minUserNum, maxUserNum);
				this.aux_max_user = Math.max(minUserNum, maxUserNum);
				let userIds = [];
				if (this.aux_min_user === this.aux_max_user) {
					userIds = [this.aux_min_user];
				} else {
					userIds = Array.from({ length: this.aux_max_user - this.aux_min_user + 1 }, (_, i) => this.aux_min_user + i);
				}

				const queryParams = this.show_dates ? `?from=${this.start_date}&to=${this.end_date}` : '';
				const padUserId = id => id < 10 ? `0${id}` :  `${id}`;
				const urls = userIds.map(id => `${api.url.general}users/alucloud${padUserId(id)}${queryParams}`);

				const responses = await Promise.all(
					urls.map(url => Axios.get(url))  
				);

				// const allUserEvents = responses.flatMap(resp => resp.data);
				// añadir evento vacio a los que no tienen eventos para que aparezcan en los calculos
				const allUserEvents = [];
				responses.forEach((resp, id) => {
					const data = resp.data;
					if (Array.isArray(data) && data.length === 0) {
						const userId = userIds[id];
						const paddedId = userId < 10 ? `0${userId}` : `${userId}`;
						allUserEvents.push({
							eventID: "none",
							eventName: "none",
							eventSource: "none",
							eventTime: "null",
							userIdentity_userName: `alucloud${paddedId}`
						});
					} else {
						allUserEvents.push(...data);
					}
				});

				//agrupar los eventos por usuario
				const groupedByUser = {};
				allUserEvents.forEach(event => {
					const user = event.userIdentity_userName;
					if (!groupedByUser[user]) {
						groupedByUser[user] = [];
					}
					groupedByUser[user].push(event);
				});

				this.search_callback(groupedByUser);

			} catch (error) {
				console.error(error);
				this.processing = false;
			} finally {
				this.processing = false;
			}
		},
		search_callback(groupedByUser) {
			this.graphData = [];
			this.all_data = [];
			this.initData = {};
			this.percentMap = {};
			this.progressMilestones = {};

			this.referData = (this.aux_selected_course.label === "MUCNAP-ICP" || this.aux_selected_course.label === "MUCC-DDS")
				? envprac.REFERDATA1
				: envprac.REFERDATA;

			const studentProgress = {}; 
			const practices = this.aux_selected_course.practices || [];

			for (const groupName of practices) {
				if (!studentProgress[groupName]) {
					studentProgress[groupName] = [];
				}
			}

			for (const [username, events] of Object.entries(groupedByUser)) {
				const userEventCounts = {}; 
				const userTimestamps = {}; 

				for (const { eventName, eventTime } of events) {
					userEventCounts[eventName] = (userEventCounts[eventName] || 0) + 1;
					if (!userTimestamps[eventName] || new Date(eventTime) > new Date(userTimestamps[eventName])) {
						userTimestamps[eventName] = eventTime;
					}
				}

				this.percentMap[username] = {}; 
				this.progressMilestones[username] = {}; 
				for (const group of practices) {
					const refGroup = this.referData[group];
					if (!refGroup) continue; // Skip if no reference data for this group

					// --- Calculation for overall completion and latest timestamp for the current group ---
					let totalCompletedEventsForGroup = 0; 
					let totalRequiredEventsForGroup = 0; 
					let latestTimestampForGroup = null; 

					for (const evName in refGroup) {
						const required = refGroup[evName];
						const count = userEventCounts[evName] || 0;
						totalRequiredEventsForGroup += required;
						totalCompletedEventsForGroup += Math.min(count, required);

						// Find the latest timestamp among events for this group
						const ts = userTimestamps[evName];
						if (ts && (!latestTimestampForGroup || new Date(ts) > new Date(latestTimestampForGroup))) {
							latestTimestampForGroup = ts;
						}
					}

					const percentStr = totalRequiredEventsForGroup ? ((totalCompletedEventsForGroup / totalRequiredEventsForGroup) * 100).toFixed(2) : '0';
					const currentOverallPercent = parseFloat(percentStr);
					this.percentMap[username][group] = { percent: currentOverallPercent };
					studentProgress[group].push(currentOverallPercent);

					this.all_data.push([
						group,
						username,
						`${percentStr} %`,
						latestTimestampForGroup ? new Date(latestTimestampForGroup).toISOString() : "N/A"
					]);

					this.progressMilestones[username][group] = {};
					let lastRecordedMilestone = 0;
					let groupSpecificEvents = [];

					for (const evName in refGroup) {
						if (userTimestamps[evName]) {
							// Add the event multiple times if required and performed multiple times
							const performedCount = userEventCounts[evName] || 0;
							for (let i = 0; i < performedCount; i++) {
								if (i < refGroup[evName]) {
									groupSpecificEvents.push({ event: evName, timestamp: new Date(userTimestamps[evName]) });
								}
							}
						}
					}
					groupSpecificEvents.sort((a, b) => a.timestamp - b.timestamp);

					let cumulativeCompletedEvents = 0; // How many *required* events have been completed
					let cumulativeEventCounts = {}; // Track counts for required events for milestone calculation

					for (const { event, timestamp } of groupSpecificEvents) {
						cumulativeEventCounts[event] = (cumulativeEventCounts[event] || 0) + 1;

						// Only count if it contributes to the *required* number for that event
						cumulativeCompletedEvents++; 
						const currentPercentForMilestones = totalRequiredEventsForGroup ? Math.floor((cumulativeCompletedEvents / totalRequiredEventsForGroup) * 100) : 0;

						// Fill in all 10% milestones between the last recorded one and the current percentage
						for (let m = lastRecordedMilestone + 10; m <= currentPercentForMilestones; m += 10) {
							const milestoneToRecord = Math.min(Math.floor(m / 10) * 10, 100); 

							if (!this.progressMilestones[username][group][milestoneToRecord]) {
								this.progressMilestones[username][group][milestoneToRecord] = timestamp.toISOString();
							}
							lastRecordedMilestone = milestoneToRecord; 
						}
					}

					// Store the exact final percentage (e.g., 64.86%) with its latest timestamp for this group
					if (totalRequiredEventsForGroup > 0 && latestTimestampForGroup !== null) {
						this.progressMilestones[username][group][(currentOverallPercent)] = new Date(latestTimestampForGroup).toISOString();
					}
				}
			}

			this.showDiv = true;
			for (const group in studentProgress) {
				const sum = studentProgress[group].reduce((a, b) => a + b, 0);
				const avg = (sum / studentProgress[group].length).toFixed(2);
				this.graphData.push([group, Number(avg)]);
			}
			
			if (this.aux_selected_course.label === "CursoCloudAWS") {
				this.filterDataByCurso(["PL_EMR", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"])
			}

			if (this.aux_selected_course.label === "MBDA-CGDNGB") {
				this.filterDataByCurso(["PL_EMR", "PL_VPC", "PL_SERVERLESS_APP", "PL_DYNAMODB","PL_CF", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"]);
			}

			if (this.aux_selected_course.label == "MBDA-MEGBD"){
				this.filterDataByCurso(["PL_EC2","PL_EC_S3","PL_VPC","PL_DYNAMODB","PL_RDS","PL_APP","PL_CF","PL_LAMBDA_SQS", "PL_SERVERLESS_APP", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"])
			
			}
			if (this.aux_selected_course.label == "MUCNAP-ICP"){
				this.filterDataByCurso(["PL_EMR", "PL_SERVERLESS_APP", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"])
			}

			if (this.aux_selected_course.label == "MUCNAP-CBD"){
				this.filterDataByCurso(["PL_EC2","PL_EC_S3","PL_VPC","PL_DYNAMODB","PL_RDS","PL_APP","PL_CF","PL_LAMBDA_SQS", "PL_SERVERLESS_APP", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"])
			}
			
			if (this.aux_selected_course.label == "MUGI-SEN"){
				this.filterDataByCurso(["PL_VPC", "PL_SERVERLESS_APP", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"])
			}
			if (this.aux_selected_course.label == "GII-LPP"){
				this.filterDataByCurso(["PL_VPC","PL_DYNAMODB","PL_RDS","PL_APP","PL_CF","PL_LAMBDA_SQS","PL_EMR","PL_SERVERLESS_APP", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"])
			}

			if (this.aux_selected_course.label == "GCD-IPD"){
				this.filterDataByCurso(["PL_VPC","PL_DYNAMODB","PL_RDS","PL_APP","PL_CF","PL_LAMBDA_SQS","PL_EMR","PL_SERVERLESS_APP", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"])
			}
			
			if (this.aux_selected_course.label == "MUCC-DDS"){
				this.filterDataByCurso(["PL_DYNAMODB","PL_EMR","PL_SERVERLESS_APP", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS"])
			}

			if (this.aux_selected_course.label == "MUIS-DOS"){
				this.filterDataByCurso(["PL_EMR", "PL_EC2_S3", "PL_VPC", "PL_RDS", "PL_SERVERLESS_APP", "PL_DYNAMODB", "PL_GRAVITON", "PL_DATA_LAKE", "PL_EVENTS_WORKFLOWS","PL_APP"]);
			}
			
			if (this.aux_selected_course.label == "TCC"){	
				this.filterDataByCurso(["PL_EMR", "PL_EC2_S3", "PL_VPC", "PL_RDS", "PL_SERVERLESS_APP", "PL_DYNAMODB","PL_APP", "PL_LAMBDA_SQS", "PL_CF" ]);
			}

			if (this.graphData.length > 0) {
				this.no_result = false;
				this.drawGraph();
				var _this = this;
				this.$nextTick(function() {
				$("#table-details")	.dataTable().fnClearTable();
				 if (_this.all_data.length != 0){
					$("#table-details").dataTable().fnAddData(_this.all_data);
				}
				$("#table-details").dataTable().fnDraw();
				if (this.aux_max_user != this.aux_min_user) {
				 	this.drawGraphsPorAlumno();
				}

				});
			} else {
				this.no_result = true;
			}
			this.processing = false;
		},
		filterDataByCurso(excluirPracticas) {
			this.graphData = this.graphData.filter((obj) =>
				!excluirPracticas.includes(obj["0"]) 
			);
			this.all_data = this.all_data.filter((obj) =>
				!excluirPracticas.includes(obj["0"]) 
			);
		},

		passesOrNot() {
			const selectedCourse = this.courseOptions.find(
				c => c.label === this.aux_selected_course.label
			);

			const relevantPractices = (selectedCourse && selectedCourse.practices) ? selectedCourse.practices : [];

			for (const [username, labs] of Object.entries(this.percentMap)) {
				const percentage = relevantPractices
					.map(practice => (labs[practice] && labs[practice].percent) ? labs[practice].percent : 0);

				const totalProgress = percentage.filter(p => p >= 80).reduce((a, b) => a + b, 0);
				const proportional = percentage.length > 0 ? ((totalProgress / 100) / percentage.length).toFixed(3) : "0.00";
				this.percentMap[username].mark = Number(proportional);
			}
		},
		drawGraphsPorAlumno() {
			for (const [user, labs] of Object.entries(this.percentMap)) {
				const labels = Object.keys(labs).filter(k => k !== 'mark');
				const data = labels.map(label => labs[label].percent);

				const myColors = [];
				const borderColor = [];
				for (let i = 0; i < data.length; i++) {
				if (data[i] >= 80 && data[i] <= 100) {
					myColors[i] = "rgba(74,227,135,0.2)";
					borderColor[i] = "rgba(0,102,0,1)";
				} else if (data[i] >= 50 && data[i] < 80) {
					myColors[i] = "rgba(204,255,51,0.5)";
					borderColor[i] = "rgba(255, 102, 0,1)";
				} else if (data[i] < 50) {
					myColors[i] = "rgba(255,51,0,0.2)";
					borderColor[i] = "rgba(255, 51, 0,1)";
				}
				}

				const ctx = document.getElementById('chart-' + user).getContext('2d');
				new Chart(ctx, {
				type: 'bar',
				data: {
					labels: labels,
					datasets: [{
					label: '%',
					data: data,
					backgroundColor: myColors,
					borderColor: borderColor,
					borderWidth: 1
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					legend: {
						display: false 
					},
					scales: {
					yAxes: [{
						ticks: {
						beginAtZero: true,
						min: 0, 
						max: 100
						}
					}]
					}
				}
				});
			}
		},
		async descargarPDF() {
			const marks = this.passesOrNot();
			this.processing=true;
			try {
				const pdfsPorAlumno = await generarPDFConGraficos(this.percentMap, this.aux_selected_course.label,this.progressMilestones, marks);
				if( Object.entries(this.percentMap).length > 1) {
					const zip = new JSZip();
					for (const [alumno, pdfBytes] of Object.entries(pdfsPorAlumno)) {
						zip.file(`${this.aux_selected_course.label}-${alumno}-reporte.pdf`,  new Blob([pdfBytes], { type: 'application/pdf' }))
					}
					zip.generateAsync({type:"blob"})
					.then((blob) => {
						saveAs(blob, `${this.aux_selected_course.label}:${this.aux_min_user}-${this.aux_max_user}`);
					})
				}
				else {
					const [alumno, pdfBytes] = Object.entries(pdfsPorAlumno)[0];
					const blob = new Blob([pdfBytes], { type: 'application/pdf' });
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = `${this.aux_selected_course.label}-${alumno}-reporte.pdf`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					setTimeout(() => URL.revokeObjectURL(url), 100);
				}
				this.processing=false;
			} catch (e) {
				console.log(error)
				this.processing = false
			}
		},
		onlyNumbers(event) {
			const charCode = event.charCode;
			if (charCode < 48 || charCode > 57) {
				event.preventDefault();
			}
		}, 
		onCourseSelected(val) {
			if (!val) return;

			const dmy = new Date();
			const currMonth = dmy.getMonth();
			const currYear = dmy.getFullYear();
			const currYearEnd = currYear + 1;

			if (val.label === "MUGI-SEN") {
				this.start_date = new Date(currYear, 1, 1);
				this.end_date = new Date(currYear, 6, 1);
			} else if (val.label === "MUCC-DDS") {
				this.start_date = new Date(currYear, 1, 1);
				this.end_date = new Date(currYear, 5, 30);
			} else {
				if (currMonth >= 8) {
				this.start_date = new Date(currYear, 8, 1);
				this.end = new Date(currYearEnd, 6, 31);
				} else {
				this.start_date = new Date(currYear - 1, 8, 1);
				this.end_date = new Date(currYearEnd - 1, 6, 31);
				}
			}

			this.start_date = moment(this.start_date).format("YYYY-MM-DD");
			this.end_date = moment(this.end_date).format("YYYY-MM-DD");

			this.start_date = moment(this.start_date).format("YYYY-MM-DD");
				this.end_date = moment(this.end_date).format("YYYY-MM-DD");
				$('#date-range').data('daterangepicker').setStartDate(moment(this.start_date).format("DD/MM/YYYY"));
        		$('#date-range').data('daterangepicker').setEndDate(moment(this.end_date).format("DD/MM/YYYY"));
				
		},
		isMobileDevice(){	 
			return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
		},
		drawGraph() {
			this.max = 100;

			var myColors = []
			var borderColor = []

			for (var i in this.graphData){
				if(this.graphData[i][1] >= 80 && this.graphData[i][1] <= 100){
					myColors[i]="rgba(74,227,135,0.2)"
					borderColor[i]="rgba(0,102,0,5)"
				} else if(this.graphData[i][1] >= 50 && this.graphData[i][1] < 80){
					myColors[i]="rgba(204,255,51,0.5)"
					borderColor[i]="rgba(255, 102, 0,1)"
				} else if(this.graphData[i][1] < 50){
					myColors[i]="rgba(255,51,0,0.2)"
					borderColor[i]="rgba(255, 51, 0,1)"
				}

			}
			$("#myChart").remove();
			$("#canva").append('<canvas id="myChart"></canvas>');
			var ctx = $("#myChart");
			var myChart = new Chart(ctx, {
				type: "bar",
				data: {
					labels: this.graphData.map(graphData => graphData[0]),
					datasets: [
						{
						label: "%",
						backgroundColor: myColors,
						borderColor: borderColor,
						borderWidth: 1,
						hoverBackgroundColor: "rgba(0, 153, 255,0.5)",
						hoverBorderColor: "rgba(0,255,255,1)",
						data: this.graphData.map(graphData => graphData[1])
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					legend: {
						display: false
					},
					plugins: {
						datalabels: {
							display: function(){

								if ($('#canva').width() < 350){
									return false
								}else{
									return true
								}
							},
							align : function (context){

								var index = context.dataIndex;
								var value = context.dataset.data[index];
								return value > 90 ? 'bottom' : 'top'


							},

							anchor: "end",
							backgroundColor: null,
							borderColor: null,
							borderRadius: 4,
							borderWidth: 1,
							color: function(context) {
								var index = context.dataIndex;
								var value = context.dataset.data[index];
								return value < 50 ? 'red' :  "black" // draw negative values in red
							},
							font: {
								size: 12,
								weight: "bold"
							},
							offset: 4,
							padding: 0,
							formatter: function(value, context) {
								return value + '%';
							}
							}
						},

					tooltips: {
						position: "nearest",
						titleFontSize: 14,
						bodyFontSize: 14
					},
					scales: {
						yAxes: [{
							display: true,
							scaleLabel: {
							display: true,
							labelString: "%",
							fontColor: "#000",
							fontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
							fontSize: 16
							},
							callback: function(value) {
								if (Number.isInteger(value)) {
									return value;
								}
							},
							gridLines: {
								display: true,
								color: "rgba(220,227,241,1)"
							},
							ticks: {
								// display: !this.isMobileDevice(),
								callback: function(value, index, values) {
									if ($('#canva').width() < 300){
										return null
									}else {
										return value
									}
								},
								beginAtZero: true,
								fontColor: "#000",
								min: 0,
								max :this.max

								}
						}],
						xAxes: [{
							display: true,
							gridLines: { display: false },
							scaleLabel: {
								display: true,
								labelString: "Laboratory practices",
								fontColor: "#000",
								fontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
								fontSize: 16
							},
							ticks: {
								callback: function(value, index, values) {
									if ($('#canva').width() < 300){
										return null
									}else {
										return value
									}
								},
							autoSkip: false,
							fontColor: "#000"
							},
							maxBarThickness: 50
						}],
						hover: {
							intersect: false
						}
					}
				}
			});

			$("#myChart").click((e) => {
				this.activeBars = myChart.getElementAtEvent(e);
				if (this.activeBars && this.activeBars[0] && this.activeBars[0]._model) {
					var find = this.activeBars[0]._model.label;
					$(".collapse").collapse('show');
					$("#table-details").DataTable().search(find).draw();
				}
			});
		},
		getRegionsEC2 () {
			var _this = this;
			return new Promise(function(resolve, reject) {
				var token = JSON.parse(window.localStorage.getItem("session")).user.token;
				var logins = {};
				var login_id = 'cognito-idp.' + _this.$cognitoAuth.options.region + '.amazonaws.com/' + _this.$cognitoAuth.options.UserPoolId;
				logins[login_id] = token;

				AWS.config.update({ region: "us-east-1" });
				AWS.config.credentials = new CognitoIdentityCredentials({
				IdentityPoolId: _this.$cognitoAuth.options.IdentityPoolId,
				Logins: logins,
				LoginId: login_id
				})

				var EC2 = require("aws-sdk/clients/ec2");
				var ec2 = new EC2({
				region: "us-east-1",
				credentials: AWS.config.credentials
				});

				var params = {};
				ec2.describeRegions(params, function(err, data) {
					if (err) console.log(err, err.stack); // an error occurred
					else {
						var regions = [];
						var regionsArray = data['Regions'];
						for (var i in regionsArray) {
						regions.push(regionsArray[i]['RegionName'])
						};
						resolve(regions);
					}
				});
			});
		},
		getPriceEC2(service, type_service, locationDescription, numberInstances) {
		var _this = this;
		return new Promise(function(resolve, reject) {

			var token = JSON.parse(window.localStorage.getItem("session")).user.token;
			var logins = {};
			var login_id = 'cognito-idp.' + _this.$cognitoAuth.options.region + '.amazonaws.com/' + _this.$cognitoAuth.options.UserPoolId;
			logins[login_id] = token;

			AWS.config.region = 'us-east-1';

			AWS.config.credentials = new CognitoIdentityCredentials({
			IdentityPoolId: _this.$cognitoAuth.options.IdentityPoolId,
			Logins: logins,
			LoginId: login_id
			})

			var Pricing = require("aws-sdk/clients/pricing");

			var pricing = new Pricing({
			region: "us-east-1",
			credentials: AWS.config.credentials
			});

			var params = {
			Filters: [
				{
				Field: "instanceType",
				Type: "TERM_MATCH",
				Value: type_service
				},
				{
				Field: "location",
				Type: "TERM_MATCH",
				Value: locationDescription
				},
				{
				Field: "operatingSystem",
				Type: "TERM_MATCH",
				Value: "Linux"
				},
				{
				Field: "tenancy",
				Type: "TERM_MATCH",
				Value: "Shared"
				},
				{
				Field: "capacitystatus",
				Type: "TERM_MATCH",
				Value: "Used"
				},
				{
				Field: "preInstalledSw",
				Type: "TERM_MATCH",
				Value: "NA"
				}
			],
			FormatVersion: "aws_v1",
			MaxResults: 1,
			ServiceCode: "AmazonEC2"
			};
			var price = 0;

			pricing.getProducts(params, function(err, data) {
			if (err) console.log(err, err.stack);
			else {
				var priceList = data["PriceList"];
				var priceOnDemand = priceList[0]["terms"]["OnDemand"];
				var priceDimensions = Object.values(priceOnDemand)[0][
				"priceDimensions"
				];
				var pricePerUnit = Object.values(priceDimensions)[0][
				"pricePerUnit"
				];
				const aux = {
				type: type_service,
				location: locationDescription,
				price: pricePerUnit["USD"]
				};
				window.localStorage.setItem(
				type_service + "_" + locationDescription,
				JSON.stringify(aux)
				);
				resolve([service, pricePerUnit["USD"] * numberInstances]);
			}
			});
		});
		},
	},

	created() {
		var dmy = new Date();
		var currMonth = dmy.getMonth();
		var currYear = dmy.getFullYear();
		var currYearEnd = dmy.getFullYear() + 1;
		
		if (currMonth >= 8){
			var  start = new Date(currYear, 8, 1);
			var  end = new Date(currYearEnd, 6, 31);
		}
		else{
			var start = new Date(currYear - 1, 8, 1);
			var end = new Date(currYearEnd - 1, 6, 31);
		}
		this.start_date = moment(start).format("YYYY-MM-DD");
		this.end_date = moment(end).format("YYYY-MM-DD");
		var _this = this;
		axios.get(api.url.general+ "users")
		.then(function(resp) {
			var session = JSON.parse(localStorage.getItem("session"))

			if (session.user.username == "alucloud189" || session.user.username == "admin"){
				_this.all_users = resp.data;
				_this.user_name = "";

			}else {
				_this.all_users = [];
				for (var i in resp.data){
					if (session.user.username == resp.data[i]){
						_this.all_users.push(resp.data[i])
					}
				}
				_this.user_name = _this.all_users[0]
			}
		}).catch(function (error) {
			if (error.response.status == 401){
				_this.$router.replace(_this.$route.query.redirect || "/logout");
				console.log("Your Session has expired ");
			}

		});
		this.initData = envprac.INITDATA;
		this.referData = envprac.REFERDATA;
	},
	watch: {
		min_user(val) {
			if (val < 0) this.min_user = 0;
			if (val > 300) this.min_user = 300;
		},
		max_user(val) {
			if (val < 0) this.max_user = 0;
			if (val > 300) this.max_user = 300;
		},
	},
	
	mounted() {
		var d = new Date();
		var currMonth = d.getMonth();
		var currYear = d.getFullYear();
		var currYearEnd = d.getFullYear() + 1;
		if (currMonth >= 8){
			var  startDateDefault = new Date(currYear, 8, 1);
			var  endDateDefault = new Date(currYearEnd, 6, 31);
		}
		else{
			var startDateDefault = new Date(currYear -1, 8, 1);
			var  endDateDefault = new Date(currYearEnd - 1, 6, 31);
		}

		var start_date_default = moment(startDateDefault).format("DD/MM/YYYY");
		var end_date_default = moment(endDateDefault).format("DD/MM/YYYY");
		var _this = this;
		$("#date-range").daterangepicker(
			{
				opens: "left",
				startDate: start_date_default,
				endDate : end_date_default,
				locale: {
				format: "DD/MM/YYYY"
				}
			},
			function(start, end, label) {
				_this.start_date = start.format("YYYY-MM-DD");
				_this.end_date = end.format("YYYY-MM-DD");
			}
		);
		$.extend( $.fn.dataTable.defaults, {
			responsive: true
		} );
		$("#table-details").DataTable({
			data: _this.all_data,
			//columns: [{ title: "#" }, { title: "Event" }, { title: "Date and Time" }],
			//columns: [{ title: "User" }, { title: "Practice" }, { title: "State" }, { title: "Percentage" }, { title: "Timestamp" }],
			columns: [{ title: "Practice" }, { title: "User" }, { title: "State" },  { title: "Timestamp" }],
			"columnDefs": [
				{className: "dt-center", "targets": "_all"}
			 ]
		});
		$('#accordion-search').on('shown.bs.collapse', function(){
			$("#table-details").DataTable().columns.adjust();
		});
	}, 
}
</script>

<style lang="scss" scoped>
@import "../../sass/_variables.scss";

 .v-select .dropdown-menu .active > a {
    color: #333;
    background: rgba(50, 50, 50, .1);
  }
  .v-select .dropdown-menu > .highlight > a {
    /*
     * required to override bootstrap 3's
     * .dropdown-menu > li > a:hover {} styles
     */
    background: #4ae387;
    color: #fff!important;
  }

.pdf-margin-top {
  margin-top: 0; /* en pantalla normal */
}

@media print {
  .pdf-margin-top {
    margin-top: 1.5cm !important;
    padding-bottom: 1cm !important; /* espacio forzado debajo */
    display: block;
    page-break-inside: avoid;
    page-break-after: auto;
  }

  canvas {
    display: block;
    margin: 0 auto 1.5cm auto; /* centrado y separado */
    page-break-inside: avoid;
  }
}

</style>