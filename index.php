<!DOCTYPE html>
<html lang="en">
<head>
	<title>Start</title>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
	<link rel="stylesheet" href="style/style.css">
	<link rel="stylesheet" href="style/tilde.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>


	<!-- CLOCK -->
	<script>
		function startTime() {
			var today = new Date();
			var h = today.getHours();
			var m = today.getMinutes();
			var s = today.getSeconds();
			m = checkTime(m);
			s = checkTime(s);
			document.getElementById('clock').innerHTML =
			h + ":" + m + ":" + s;
			var t = setTimeout(startTime, 500);
		}
		function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}
</script>
<!-- End CLock  -->

</head>
<body onload="startTime()">
	<div class="container2">
		<div class="row">
			<div class="col-4 col-md-2 col-lg-2 order-last order-sm-3 order-md-2 order-lg-1 slices">
				<br /><br />
				<!-- Left Part with Links -->
				<div class="slices">
					<a href="https://www.google.com/"><img src="slices/google.png" height="35" class="round" /></a>
				</div>
				<div class="slices">
					<a href="https://www.youtube.com"><img src="slices/youtube.png" height="35" class="round" /></a>
				</div>
				<div class="slices">
					<a href="https://www.netflix.com"><img src="slices/netflix.png" height="35" class="round" /></a>
				</div>
				<div class="slices">
					<a href="https://bitcoin-live.de"><img src="slices/btclive.png" height="35" class="round" /></a>
				</div>
				<div class="slices">
					<a href="https://www.swp.de"><img src="slices/swp.png" height="35" class="round" /></a>
				</div>
				<div class="slices">
					<a href="https://www.grenzwissenschaft-aktuell.de"><img src="slices/grewi.png" height="35" class="round" /></a>
				</div>
				<div class="slices">
					<a href="https://www.spiegel.de"><img src="slices/spiegel.png" height="35" class="round" /></a>
				</div>
				<div class="slices">
					<a href="https://www.sueddeutsche.de"><img src="slices/sz.png" height="35" class="round" /></a>
				</div>

				<!-- Bitcoin.de - Price Widget - 300x250px, dark -->
				<div class="slices">
					<a href="https://www.bitcoin.de/de/r/kh9xz9">
						<div id="bitcoin-de-widget" data-size="1" data-type="Black" data-bgcolor="#000000" class="slices" style="box-sizing:content-box;"></div>
						<script src="https://bitcoinapi.de/price/widget.js"></script>
					</a>
				</div>
				<!-- Bitcoin Fear and Greeat Index -->
				<div class="slices" id="fng">
					<img src="https://alternative.me/crypto/fear-and-greed-index.png" alt="Latest Crypto Fear & Greed Index" height="150" width="150" />
				</div>
			</div>
			<!-- Midle Part is to separate the cols in the middle -->
			<div class="col-10 col-md-7 col-lg-6 order-2 order-md-first order-lg-2 ">
				<div class="row">
					<!-- The Search Engine Part -->
					<div class="col-12 order-first">
						<div class="override">
							<form autocomplete="off" class="clock search-form" id="search-form" spellcheck="false">
								<div>
									<input class="search-input" id="search-input" title="search" type="text" placeholder="--> Internet hier <--" />
									<div id="output"></div>
									<ul class="search-suggestions" id="search-suggestions"></ul>
								</div>
							</form>
						</div>
					</div>					
					<div class="col-12 order-last">
						<div class="rss" >
							<!-- The RSS Reader Part, there are 2 equivalent scripts in php so it can handle 2 different amounts of liks from the reader -->
							<!-- RSS handles the design part of the RSS List -->
							<?php 
							$newsSource = array(
								array(
									"title" => "<a href='https://www.golem.de/'>Golem.de</a>",
									"url" => "https://rss.golem.de/rss.php?feed=RSS2.0"
								),
								array(
									"title" => "<a href='https://www.heise.de/'>Heise</a>",
									"url" => "https://www.heise.de/rss/heise.rdf"
								)

							);
							function printFeed($url){
								$rss = simplexml_load_file($url);
								$count = 0;
								print '<ul>';
								foreach($rss->channel->item as$item) {
									$count++;
									if($count > 7){
										break;
									}
									print '<li><a target="_blank" href="'.$item->link.'">'.$item->title.'</a></li>';
								}
								print '</ul>';
							}
							foreach($newsSource as $source) {
								print '<h2>'.$source["title"].'</h2>';
								printFeed($source["url"]);
							}
							?>
							<!-- End of the first 2 RSS Parts -->
							<!-- Did You know that you can add different and more RSS Feeds ?-->
							<!-- Begin of second RSS Reader with different Setting-->
							<?php

							$newsSource2 = array(
								array(
									"title" => "Bitcoin",
									"url" => "http://www.rssmix.com/u/8365079/rss.xml"
								)
							);

							function printFeed2($url2){
								$rssa = simplexml_load_file($url2);
								$ca = 0;
								print '<ul>';
								foreach($rssa->channel->item as$item) {
									$ca++;
									if($ca > 20){
										break;
									}
									print '<li><a target="_blank" href="'.$item->link.'">'.$item->title.'</a></li>';
								}
								print '</ul>';
							}
							foreach($newsSource2 as $sourcea) {
								print '<h2>'.$sourcea["title"].'</h2>';
								printFeed2($sourcea["url"]);
							}
							?> 
							<!-- End of the RSS Readers-->
						</div>
					</div>
				</div>
			</div>
			<!-- The right side with the Clock and other Crypto Related stuff-->
			<div class="col-6 col-md-5 col-lg-4 order-first order-md-2 order-lg-last" >
				<div id="clock" style="font-size:70px;height:100px; margin-bottom:30px;"></div>
				<div class="chart">
					<!-- TradingView Widget BEGIN -->
					<script type="text/javascript" src="https://d33t3vvu2t2yu5.cloudfront.net/tv.js"></script>
					<script type="text/javascript">
						new TradingView.widget({
							"autosize": true,
							"symbol": "BITSTAMP:BTCUSD",
							"interval": "1",
							"timezone": "Europe/Berlin",
							"theme": "Black",
							"style": "1",
							"locale": "de",
							"toolbar_bg": "rgba(0, 0, 0, 1)",
							"hide_top_toolbar": false,
							"save_image": false,
							"hideideas": true
						});
					</script>
					<!-- TradingView Widget END -->
				</div>
				<!-- The Coin360 Roundup in a small Window-->
				<iframe src="https://coin360.com/widget/map.html" frameborder="0" title="Coin360.com: Cryptocurrency Market State"<iframe src="https://coin360.com/widget/map.html" frameborder="0" title="Coin360.com: Cryptocurrency Market State" width="400" height="300"></iframe></iframe>
			</div>
			<!-- Optional JavaScript -->
			<!-- The Search Field in the top is handled by the script-->
			<script src="script/tilde.js"></script>
			<!-- End of Search Script-->
			<!-- jQuery first, then Popper.js, then Bootstrap JS -->
			<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
			<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
		</body>
	</body>
	</html>
