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
		//var sections = ["startPage", "demography", "framing", "pns", "rei", "submit"]; // velten, panas, start
		$scope.questions = Questions.get();
		$scope.currentSection = "startPage";
		$scope.startAnswers = [];
		$scope.pnsAnswers = [];
		$scope.reiAnswers = [];
		$scope.framingAnswers = [];

		$scope.showSection = function(section) {
			console.log("showing: " + section);
				
			$scope.currentSection = section;
			$scope["show" + section] && $scope["show" + section]();
		};

		var framingStart;

		$scope.showframing = function() {
			$scope.framingOriginal = $scope.questions.framing.slice();

			randomize($scope.questions.framing);

			console.log("framing original names:");
			for (var i=0; i< $scope.framingOriginal.length; i++) {
				console.log($scope.framingOriginal[i].name);
			}

			console.log("framing randomized names:");
			for (var i=0; i < $scope.questions.framing.length; i++) {
				console.log($scope.questions.framing[i].name);
			}

			$scope.currentFrm = 0;
			framingStart = new Date().getTime();
		};

		$scope.nextFraming = function(index, answer) {
			
			$scope.framingAnswers.push({
				time : new Date().getTime() - framingStart,
				answer : answer,
				name: $scope.questions.framing[index].name
			});

			framingStart = new Date().getTime();
			console.log(index+ ":" + answer);

			if (index == $scope.questions.framing.length - 1) {
				if ($scope.falckCode) {
					$scope.showSection("submit");
				} else {
					$scope.showSection("pns");
				}
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
				falckCode: $scope.falckCode,
				
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
			sa.push("experiment2", "vek", "pohlavie", "roky praxe", "povolanie", "falckCode");

			for (var i = 0; i < $scope.framingOriginal.length; i++) {
				sa.push("frmOdpoved_"+$scope.framingOriginal[i].name);
				sa.push("frmCas_"+$scope.framingOriginal[i].name);
			}

			if (!$scope.falckCode) {
				
				for (var i = 1; i < data.pnsAnswers.length+1; i++) {
					sa.push("PNS"+i);
				}

				for (var i = 1; i < data.reiAnswers.length+1; i++) {
					sa.push("REI"+i);
				}
			}

			return sa.join(";");
		}

		function serializeData(data) {
			var sa = [];

			sa.push("experiment2", data.age, data.sex, data.practise, data.jobName, data.falckCode || "");

			for (var j=0; j< $scope.framingOriginal.length; j++) {
				var originalName = $scope.framingOriginal[j].name;
				for (var i = 0; i < data.framingAnswers.length; i++) {
					var result = data.framingAnswers[i];
					if (originalName == result.name) {
						sa.push(result.answer, result.time);
					}
				}
			}


			if (!$scope.falckCode) {
				Array.prototype.push.apply(sa,data.pnsAnswers);
				Array.prototype.push.apply(sa,data.reiAnswers);
			}
			
			return sa.join(";");
		}


		Array.prototype.swap = function (x,y) {
		  var b = this[x];
		  this[x] = this[y];
		  this[y] = b;
		  return this;
		}

		function randomize(array){
			for (var i = 0; i < array.length*100; i++) {
				var ind1 = getRandomInt(0, array.length-1);
				var ind2 = getRandomInt(0, array.length-1);
				//console.log(ind1+", "+ind2);
				array.swap(ind1, ind2);
			}
		}

		/**
		 * Returns a random integer between min (inclusive) and max (inclusive)
		 * Using Math.round() will give you a non-uniform distribution!
		 */
		function getRandomInt(min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		}

      
	}
]);


