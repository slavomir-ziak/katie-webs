'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';
import Swipeable from 'react-swipeable'

const portfolio = require('./data/portfolio.json');

const GalleryPicture = function ({imgSrc, caption, altText}) {
	return <div className="gallery-image" >
		<img src={imgSrc} alt={altText} />
        <span className="gallery-image-caption"> {caption || altText} </span>
    </div>;
}

const page = 4;

class Gallery extends React.Component {
	constructor(props) {
		super(props);
		this.state = {index: 0};
	}
	next() {
		if (this.state.index + page < this.props.pictures.length) {
			this.setState({index: this.state.index + page});	
		}
	}
	prev() {
		if (this.state.index - page >= 0) {
			this.setState({index: this.state.index - page})
		}
	}
	prevDisabled() {
		return this.state.index <= 0;
	}
	nextDisabled() {
		return this.state.index + page >= this.props.pictures.length;
	}
	openCarousel(index) {
		this.setState({carousel: true, carouselOpenedAtIndex: index})
	}
	closeCarousel() {
		this.setState({carousel: false})
	}
	extractLang(language) {
		return language.substring(0, 2);
	}
	componentWillReceiveProps(newProps){
		if (this.props.language !== newProps.language) {
			$.getJSON(`/data/localisation-${this.extractLang(newProps.language)}.json`, '', (json) => this.setState({localisation: json}));			
		}
	}
	render() {

		return <div className="container-fluid">
			<div className="row gallery-row">{
				this.props.pictures
					.slice(this.state.index, this.state.index + page)
					.map((pic, index) => 
						<div className="col-xs-6 col-sm-3 ks-gallery-col-12" onClick={() => this.openCarousel(this.state.index + index)} key={pic.image}>
							<GalleryPicture 
								imgSrc={pic.image}
								caption={this.state.localisation ? this.state.localisation[pic.localisation] : null}
								altText={pic.alt}
							/>
						</div>
					)
			}</div>
			<button className="btn btn-default gallery-button" onClick={() => this.prev()} disabled={this.prevDisabled()}>
				{this.state.localisation ? this.state.localisation['prev'] : '&lt;'}
			</button>
			<button className="btn btn-default gallery-button" onClick={() => this.next()} disabled={this.nextDisabled()}>
				{this.state.localisation ? this.state.localisation['next'] : '&gt;'}
			</button>{
			this.state.carousel &&
				<Carousel 
					pictures={this.props.pictures} 
					closeCarousel={() => this.closeCarousel()} 
					index={this.state.carouselOpenedAtIndex}
				/>}
		</div>;
	}
}

class Carousel extends React.Component {

	constructor(props) {
		super(props);
		this.state = {index: props.index};
		this.ESCAPE_CODE = 27;
		this.RIGHT_ARROW_CODE = 39;
		this.LEFT_ARROW_CODE = 37;
	}
	next() {
		if (this.state.index + page < this.props.pictures.length) {
			this.setState({index: this.state.index + page});	
		}
	}
	prev() {
		if (this.state.index - page >= 0) {
			this.setState({index: this.state.index - page})
		}
	}
	prevDisabled() {
		return this.state.index <= 0;
	}
	nextDisabled() {
		return this.state.index + page >= this.props.pictures.length;
	}
	close() {
		this.props.closeCarousel();
	}
	onKeyDown(e) {
		switch (e.keyCode) {
			case this.ESCAPE_CODE: this.close(); break;
			case this.RIGHT_ARROW_CODE: this.prev(); break;
			case this.LEFT_ARROW_CODE: this.next(); break;
		} 
	}
	componentDidMount() {
  		window.addEventListener("keydown", (e) => this.onKeyDown(e));
	}
	componentWillUnmount() {
  		window.removeEventListener("keydown", (e) => this.onKeyDown(e));
	}
	render() {
		return <div className="ks-carousel">
	      <Swipeable
	        onSwipedRight={() => this.prev()}
	        onSwipedLeft={() => this.next()}
	        style={{touchAction: 'none' }}
	        className="ks-container"
	        trackMouse
	        preventDefaultTouchmoveEvent >
		        
		        <img src={this.props.pictures[this.state.index].image} className="ks-image"></img>

				<div className="ks-image-carousel"></div>
				<div className="ks-test__prev" disabled={this.prevDisabled()} onClick={() => this.prev()}></div>
				<div className="ks-test__next" disabled={this.nextDisabled()} onClick={() => this.next()}></div>
				<div className="ks-test__close" onClick={() => this.close()}></div>
	      </Swipeable>
		</div>;
	}
};

function renderGallery(language) {
	ReactDOM.render(
	  	<Gallery pictures={portfolio} language={language} />,
	  	document.getElementById('reactAppRoot')
	);
}


const defaultLanguage = window.navigator.userLanguage || window.navigator.language;
renderGallery(defaultLanguage);

window.renderGallery = renderGallery;
