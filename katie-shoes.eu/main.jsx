'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';
import Swipeable from 'react-swipeable'
import ImageLoader from 'react-load-image';

const portfolio = require('./data/portfolio.json');

function GalleryPreloader() {
    return <img src="images/spinner.gif" />;
}
const GalleryPicture = function ({imgSrc, caption, altText}) {
	return <div className="gallery-image" >
		<ImageLoader src={imgSrc}  style={{backgroundColor: 'black'}}>
	    	<img alt={altText}/>
	    	<div>Error!</div>
	    	<GalleryPreloader />
	  	</ImageLoader>

        <span className="gallery-image-caption"> {caption || altText} </span>
    </div>;
};

const DEFAULT_PAGE_SIZE = 4;

class Gallery extends React.Component {
	constructor(props) {
		super(props);
		this.state = {index: 0, page: DEFAULT_PAGE_SIZE};
	}
	next() {
		if (this.state.index + this.state.page < this.props.pictures.length) {
			this.setState({index: this.state.index + this.state.page});	
		}
	}
	prev() {
		if (this.state.index - this.state.page >= 0) {
			this.setState({index: this.state.index - this.state.page})
		} else {
			this.setState({index: 0});
		}
	}
	prevDisabled() {
		return this.state.index <= 0;
	}
	nextDisabled() {
		return this.state.index + this.state.page >= this.props.pictures.length;
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
			$.getJSON(`data/localisation-${this.extractLang(newProps.language)}.json`, '', (json) => this.setState({localisation: json}));			
		}
	}
	onResize() {
		if (window.innerWidth > 767) {
			this.setState({page: 4});
		}
		if (window.innerWidth <= 767) {
			this.setState({page: 2});
		}
		if (window.innerWidth <= 480) {
			this.setState({page: 1});
		}
	}
	componentDidMount() {
		this.onResize();
  		window.addEventListener("resize", (e) => this.onResize());
	}
	componentWillUnmount() {
  		window.removeEventListener("resize", (e) => this.onResize());
	}
	render() {

		return <div className="container-fluid">
			<div className="row gallery-row">{
				this.props.pictures
					.slice(this.state.index, this.state.index + this.state.page)
					.map((pic, index) => 
						<div className="col-xs-6 col-sm-3 ks-gallery-col-12" onClick={() => this.openCarousel(this.state.index + index)} key={pic.image}>
							<GalleryPicture 
								imgSrc={'images/portfolio/small/' + pic.image}
								caption={this.state.localisation ? this.state.localisation[pic.localisation] : null}
								altText={pic.alt}
							/>
						</div>
					)
			}</div>
			<a className="btn btn-large btn-primary gallery-button" onClick={() => this.prev()} disabled={this.prevDisabled()}>
				{this.state.localisation ? this.state.localisation['prev'] : 'prev'}
			</a>
			<a className="btn btn-large btn-primary gallery-button" onClick={() => this.next()} disabled={this.nextDisabled()}>
				{this.state.localisation ? this.state.localisation['next'] : 'next'}
			</a>{
			this.state.carousel &&
				<Carousel 
					pictures={this.props.pictures} 
					closeCarousel={() => this.closeCarousel()} 
					index={this.state.carouselOpenedAtIndex}
				/>}
		</div>;
	}
}


function CarouselPreloader() {
    return <img className="ks-spinner-full" src="images/spinner.gif" />;
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
		if (this.state.index + 1 < this.props.pictures.length) {
			this.setState({index: this.state.index + 1});	
		}
	}
	prev() {
		if (this.state.index - 1 >= 0) {
			this.setState({index: this.state.index - 1})
		}
	}
	prevDisabled() {
		return this.state.index <= 0;
	}
	nextDisabled() {
		return this.state.index + 1 >= this.props.pictures.length;
	}
	close() {
		this.props.closeCarousel();
	}
	onKeyDown(e) {
		switch (e.keyCode) {
			case this.ESCAPE_CODE: this.close(); break;
			case this.RIGHT_ARROW_CODE: this.next(); break;
			case this.LEFT_ARROW_CODE: this.prev(); break;
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

					<ImageLoader src={'images/portfolio/big/' + this.props.pictures[this.state.index].image} >
				    	<img className="ks-image" />
				    	<div>Error!</div>
				    	<CarouselPreloader />
				  	</ImageLoader>
					<div className="ks-image-carousel"/>
					<div className="ks-test__prev" disabled={this.prevDisabled()} onClick={() => this.prev()}/>
					<div className="ks-test__next" disabled={this.nextDisabled()} onClick={() => this.next()}/>
					<div className="ks-test__close" onClick={() => this.close()}/>
					<div className="ks-test__close-upper" onClick={() => this.close()}>Close</div>
			</Swipeable>
		</div>;
	}
}


function renderGallery(language) {
	ReactDOM.render(
	  	<Gallery pictures={portfolio} language={language} />,
	  	document.getElementById('reactAppRoot')
	);
}


const defaultLanguage = window.navigator.userLanguage || window.navigator.language;
renderGallery(defaultLanguage);

window.renderGallery = renderGallery;
