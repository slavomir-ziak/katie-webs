$('#mainWrapper')[0].style.display = "block";

var app = angular.module('questionnaire', ['ngResource']);

app.factory('Questions', [
	'$resource',
	function($resource){
		return $resource('questions.json', {}, {
			get: {method:'GET', params:{}, isArray:false}
		});
	}
]);

function handleFullscreenExit(e) {
	if (!document.webkitFullscreenElement && !document.mozFullScreenElement) {
		document.location.reload();
	}
}

document.addEventListener("webkitfullscreenchange", handleFullscreenExit);
document.addEventListener("webkitfullscreenerror", handleFullscreenExit);
document.addEventListener("mozfullscreenchange", handleFullscreenExit);
document.addEventListener("mozfullscreenerror", handleFullscreenExit);

function watchBlur2() {
	$(window).blur(function() {
		document.location.reload();
	});
}

app.controller('QuestionsCtrl', [
	'$scope', 'Questions',
	function($scope, Questions) {
		var audio;
		var sections = ["startPage", "demography", "framing", "pns", "rei", "submit"]; // velten, panas, start
		$scope.questions = Questions.get();
		$scope.currentSection = "startPage";
		$scope.startAnswers = [];
		$scope.pnsAnswers = [];
		$scope.reiAnswers = [];
		$scope.framingAnswers = [];

		$scope.showSection = function(section) {
			$scope.currentSection = section;
			$scope["show" + section] && $scope["show" + section]();
		};

		var framingStart;

		$scope.showframing = function() {
			$scope.currentFrm = 0;
			framingStart = new Date().getTime();
		};

		$scope.nextFraming = function(index, answer) {
			
			$scope.framingAnswers.push({
				time : new Date().getTime() - framingStart,
				answer : answer
			});

			framingStart = new Date().getTime();
			console.log(index+ ":" + answer);

			if (index == $scope.questions.framing.length - 1) {
				$scope.showSection("pns");
				console.log($scope.framingAnswers);
			} else {
				$scope.currentFrm = index + 1;	
			}
		};

		var data;
		$scope.showsubmit = function() {

			$scope.pnsAnswers[4] = (7 - $scope.pnsAnswers[4]) + "";
			$scope.pnsAnswers[1] = (7 - $scope.pnsAnswers[1]) + "";
			$scope.pnsAnswers[5] = (7 - $scope.pnsAnswers[5]) + "";
			$scope.pnsAnswers[10] = (7 - $scope.pnsAnswers[10]) + "";

			var reiInvert = $scope.questions.rei.negative;
			for (var i = 0; i < reiInvert.length; i++) {
				$scope.reiAnswers[reiInvert[i]] = (7 - $scope.reiAnswers[reiInvert[i]]) + "";
			}

			data = {
				age: $scope.age,
				sex: $scope.sex,
				practise: $scope.practise,
				jobName: $scope.jobName,
				
				framingAnswers : $scope.framingAnswers,
				pnsAnswers : $scope.pnsAnswers,
				reiAnswers : $scope.reiAnswers
			};
			console.log(data);
			sendResults();
		};

		$scope.showQuestion = function(index) {
			$scope.currentQuestion = index;
			console.log(index);
			audio && audio.pause();
			if (index < $scope.questions.length) {
				audio = new Audio($scope.questions[index].song);
				audio.play();
			}
		};
		$scope.startQuestions = function() {
			var	el = document.documentElement, 
				rfs = el.requestFullScreen
			|| el.webkitRequestFullScreen
			|| el.msRequestFullscreen
			|| el.mozRequestFullScreen;

			if (rfs) {
			//	rfs.call(el, Element.ALLOW_KEYBOARD_INPUT);
			}

			$scope.showSection("demography");

			//			window.onbeforeunload = function() {
			//				return "adasd";
			//			}
		};
		
		function davajBodky(){
			bodky = document.getElementById("bodky");
			bodky.innerText = bodky.innerText + " .";
		}

		function sendResults() {
            var serializedHeader = serializeHeader(data);
            console.log(serializedHeader);

			var serializedData = serializeData(data);
			console.log(serializedData);
			var content = serializedHeader+"\n\r"+serializedData;

			var blob = new Blob([ content ], { type: "text/csv"});

			var params = '{"auth":{"expires": "2015/10/19 09:01:20+00:00","key":"9b1e93f05af411e481a62561be869cb8"},"template_id": "dc003a405af411e49922a70ffbc4fd6d"}';
			var signature = null;

			var transloadit = new TransloaditXhr({
			   params: params,
			   signature: signature,

			   successCb: function(fileUrl) {
					alert("Dáta úspešne odoslané.");
					window.clearInterval(bodkyTimer);
					bodky = document.getElementById("bodky");
					bodky.innerText = bodky.innerText + " hotovo. Môžete zatvoriť okno.";
			   },

			   errorCb: function(error) {
			          alert("Pri odosielaní dát nastal problém:"+error);
			   }
			});
			var bodkyTimer = setInterval(davajBodky, 700);
			transloadit.uploadFile(blob);

		}

		function serializeHeader(data) {
			var sa = [];
			sa.push("experiment2", "vek", "pohlavie", "roky praxe", "povolanie");

			for (var i = 1; i < data.framingAnswers.length+1; i++) {
				sa.push("frmOdpoved_"+i);
				sa.push("frmCas_"+i);
			}

			for (var i = 1; i < data.pnsAnswers.length+1; i++) {
				sa.push("PNS"+i);
			}

			for (var i = 1; i < data.reiAnswers.length+1; i++) {
				sa.push("REI"+i);
			}

			return sa.join(";");
		}

		function serializeData(data) {
			var sa = [];

			sa.push("experiment2", data.age, data.sex, data.practise, data.jobName);

			for (var i = 0; i < data.framingAnswers.length; i++) {
				var result = data.framingAnswers[i];
				sa.push(result.answer, result.time);
			}

			Array.prototype.push.apply(sa,data.pnsAnswers);
			Array.prototype.push.apply(sa,data.reiAnswers);
			
			return sa.join(";");
		}

      
	}
]);


