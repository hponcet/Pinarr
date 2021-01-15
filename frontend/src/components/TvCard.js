import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

class TvCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      onServer: false,
      imdbId: false,
      tmdbId: false,
      inView: false,
    };
    this.getMovie = this.getSeries.bind(this);
    this.card = React.createRef();
    this.inView = this.inView.bind(this);
  }

  componentDidMount() {
    // this.getSeries();
    this.inView();
  }

  componentDidUpdate() {
    if (!this.state.inView) {
      this.inView();
    }
  }

  inView() {
    const left = this.card.current.getBoundingClientRect().left;
    if (left <= this.props.width * 2) {
      this.setState({
        inView: true,
      });
      this.getSeries();
    }
  }

  getSeries() {
    let series = this.props.series;
    let id = series.id;
    if (!this.props.api.series_lookup[id]) {
      // check for cached

      if (!id) return false;
      Api.series(id, true);
    }
  }

  render() {
    let id = this.props.series.id;
    if (!id || id === "false") {
      return null;
    }
    let series = this.props.api.series_lookup[id];
    if (!series) {
      return (
        <div ref={this.card} key={id} data-key={id} className={"card type--movie-tv "}>
          <div className="card--inner">
            <Link to={`/series/${id}`} className="full-link"></Link>
            <div className="image-wrap">
              <div className="no-poster"></div>
            </div>
            <div className="text-wrap">
              <p className="title">
                Loading...
                <span className="year"></span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    let img = series.poster_path ? (
      <LazyLoadImage
        alt={series.title}
        src={`https://image.tmdb.org/t/p/w200/${series.poster_path}`}
        // effect="blur"
      />
    ) : (
      <div className="no-poster"></div>
    );
    return (
      <div ref={this.card} key={series.id} data-key={series.id} className={"card type--movie-tv " + (series.on_server ? "on-server" : "")}>
        <div className="card--inner">
          <Link to={`/series/${series.id}`} className="full-link"></Link>

          <div className="image-wrap">
            {this.props.popular_count ? <p className="popular-card--count">{this.props.popular_count}</p> : null}
            {img}
          </div>
          <div className="text-wrap">
            <p className="title">
              {series.name}
              <span className="year">{this.props.character ? this.props.character : "(" + new Date(series.first_air_date).getFullYear() + ")"}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

TvCard = withRouter(TvCard);

function TvCardContainer(props) {
  return <TvCard api={props.api} series={props.series} character={props.character} pos={props.pos} width={props.width} popular_count={props.popular_count} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
  };
};

export default connect(mapStateToProps)(TvCardContainer);
