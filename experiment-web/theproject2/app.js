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
		var sections = ["startPage", "demography", "framing", "startInstr", "start", "pns", "rei", "submit"];
		$scope.questions = Questions.get();
		$scope.currentSection = "startPage";
		$scope.startAnswers = [];
		$scope.pnsAnswers = [];
		$scope.reiAnswers = [];

		$scope.showSection = function(section) {
			$scope.currentSection = section;
			$scope["show" + section] && $scope["show" + section]();
		};

		$scope.showvelten = function() {
			var a = Math.random();
			$scope.affection = a > 0.5 ? "positive" : "negative";
			var quotes = $scope.questions.velten[$scope.affection];
			$scope.veltenQuote = quotes[0];
			$scope.veltenIndex = 0;
			watchBlur2();
		};

		$scope.nextVeltenQuote = function() {
			$scope.veltenIndex++;
			if ($scope.veltenIndex == 1) {
				$scope.audio = new Audio($scope.affection + ".mp3");
				$scope.audio.play();
			}
			if ($scope.veltenIndex >= $scope.questions.velten[$scope.affection].length) {
				$scope.audio.pause();
				$scope.showSection("panas");
			} else {
				$scope.veltenQuote = $scope.questions.velten[$scope.affection][$scope.veltenIndex];
			}
		};

		var framingPosStart, framingPosDuration, framingNegStart, framingNegDuration;
		$scope.showframing = function() {
			$scope.currentFrm = 0;
			framingPosStart = new Date().getTime();
		};

		$scope.negFraming = function() {
			framingNegStart = new Date().getTime();
			framingPosDuration = framingNegStart - framingPosStart;
			$scope.framing = 2;	
		};

		var startTime;
		$scope.showstart = function() {
			$scope.currentQuestion = 0;	
			startTime = new Date().getTime();
			framingNegDuration = startTime - framingNegStart;
		};
		$scope.vote = function(index, color) {
			$scope.startAnswers.push({
				time : new Date().getTime() - startTime,
				color : color,
				correct : color == $scope.questions.start[index].color
			});
			startTime = new Date().getTime();
			if (index == $scope.questions.start.length - 1) {
				$scope.showSection("pns");
			} else {
				$scope.currentQuestion = index + 1;	
			}
		};

		$scope.nextFraming = function(index, form) {
			$scope.currentFrm = index + 1;	
			console.log(form);
		};

		var data;
		$scope.showsubmit = function() {
			//			console.log($scope); 1,4,5,10

			$scope.pnsAnswers[4] = (7 - $scope.pnsAnswers[4]) + "";
			$scope.pnsAnswers[1] = (7 - $scope.pnsAnswers[1]) + "";
			$scope.pnsAnswers[5] = (7 - $scope.pnsAnswers[5]) + "";
			$scope.pnsAnswers[10] = (7 - $scope.pnsAnswers[10]) + "";

			var reiInvert = $scope.questions.rei.negative;
			for (var i = 0; i < reiInvert.length; i++) {
				$scope.reiAnswers[reiInvert[i]] = (7 - $scope.reiAnswers[reiInvert[i]]) + "";
			}

			data = {
				identifier: $scope.identifier,
				age: $scope.age,
				sex: $scope.sex,
				practise: $scope.practise,
				affection: $scope.affection,

				framingPosDuration : framingPosDuration,
				framingPositive : $scope.framingPositive,
				framingNegDuration : framingNegDuration,
				framingNegative : $scope.framingNegative,

				startAnswers : $scope.startAnswers,
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

			$scope.identifier = Math.round(Math.random() * 1000000);

			$scope.showSection("demography");

			//			window.onbeforeunload = function() {
			//				return "adasd";
			//			}
		};

		function sendResults() {
            var serializedHeader = serializeHeader(data);
            console.log(serializedHeader);

			var serializedData = serializeData(data);
			console.log(serializedData);
			var content = serializedHeader+"\n\r"+serializedData;

			var blob = new Blob([ content ], { type: "text/xml"});
			var params = '{"auth":{"key":"9b1e93f05af411e481a62561be869cb8"},"template_id": "dc003a405af411e49922a70ffbc4fd6d"}';
			var signature = '{"auth":{"key":"9b1e93f05af411e481a62561be869cb8"},"template_id":"dc003a405af411e49922a70ffbc4fd6d"}';

			var transloadit = new TransloaditXhr({
			   params: params,
			   signature: signature,

			   successCb: function(fileUrl) {
			           alert("Dáta úspešne odoslané.");
			   },

			   errorCb: function(error) {
			           alert("Pri odosielaní dát nastal problém:"+error);
			   }
			});

			transloadit.uploadFile(blob);

		}


		function serializeData(data) {
			var sa = [];
			sa.push(data.age,data.sex,data.practise);
			Array.prototype.push.apply(sa,data.panas);
			sa.push(data.framingPosDuration, data.framingPositive, data.framingNegDuration, data.framingNegative);
			for (var i = 0; i < data.startAnswers.length; i++) {
				var result = data.startAnswers[i];
				sa.push(result.time,result.color,result.correct);
			}
			Array.prototype.push.apply(sa,data.pnsAnswers);
			Array.prototype.push.apply(sa,data.reiAnswers);
			sa.push(data.identifier, data.affection);

			return sa.join(";");
		}

       function serializeHeader(data) {
           var sa = [];
           sa.push("vek", "pohlavie", "roky praxe");
           
           for (var i = 1; i < data.panas.length+1; i++) {
                   sa.push("panas"+i);
           }

           sa.push("framingpoz_cas","framing pozitivny","framingneg_cas","framing negativny");
           
           for (var i = 1; i < data.startAnswers.length+1; i++) {
                   sa.push(i+"cas",i+"odpoved",i+"vyhodnotenie");
           }
           for (var i = 1; i < data.pnsAnswers.length+1; i++) {
                   sa.push("PNS"+i);
           }
           for (var i = 1; i < data.reiAnswers.length+1; i++) {
                   sa.push("REI"+i);
           }

           sa.push("cislelny kod", "nalada");

           return sa.join(";");
       }

	}
]);


