import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import superagent from "superagent";
import { updateImage } from "../../Actions/image.action.creators";
import { changeLabels } from "../../Actions/label.action.creators";
import LabelingContent from "./LabelingContent.js";
import loading from "./loading.svg";
import "./loading.css";
import ReactGA from "react-ga";


let HOST_RES = "https://curbmap.com:50003";
// if (process.env.REACT_APP_STAGE === "dev") {
//   HOST_RES = "http://localhost:8081";
// }
console.log("HOST_RES", HOST_RES);
class Labeling extends Component {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.gotImage = this.gotImage.bind(this);
    this.sentRects = this.sentRects.bind(this);
    this.state = {
      imageUpdated: 0,
      morePhotos: true
    };
  }

  save(state, session, username) {
    if (this.props.image) {
      superagent
        .post(HOST_RES + "/postRects/")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .set("Access-Control-Allow-Origin", "*")
        .set("Authorization", "Bearer " + this.props.token)
        .send(state)
        .then(this.sentRects)
        .catch(err => {
          console.log("ERR SENDING RECTS", err);
        });
      console.log(state);
    }
  }
  sentRects(res) {
    console.log(res);
    this.props.dispatch(updateImage({ file: null, id: null, image: null }));
    this.counter = 0;
    this.getImage();
  }
  previous() {}
  next() {}
  componentDidMount() {
    ReactGA.initialize("UA-100333954-1");
    ReactGA.pageview(window.location.pathname + window.location.search);
    this.getImage();
  }
  componentWillUnmount() {
    this.props.dispatch(changeLabels([]));
  }
  getImage() {
    superagent
      .post(HOST_RES + "/getPhoto/")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Access-Control-Allow-Origin", "*")
      .set("Authorization", "Bearer " + this.props.token)
      .then(this.gotImage)
      .catch(err => {
        console.log("ERR", err);
      });
  }
  counter = 0;
  gotImage(res) {
    console.log(res);
    if (res.body.success === false) {
      this.setState({ morePhotos: false });
    } else {
      if (this.counter === 0) {
        console.log("GOT IMAGE");
        this.counter = this.counter + 1;
        this.props.dispatch(updateImage(res.body));
      }
    }
  }
  render() {
    if (this.props.image) {
      return (
        <div>
          <LabelingContent
            key={`LabelingContent${this.counter}`}
            image={this.props.image}
            imageid={this.props.imageid}
            previous={this.previous}
            next={this.next}
            save={this.save}
          />
        </div>
      );
    } else {
      return (
        <div className="loading-holder">
          <div className="loading-div">
            {this.state.morePhotos && (
              <div>
                <img
                  src={loading}
                  className="loading"
                  alt="loading the labeling component..."
                />
                <br />
                {"Loading photos..."}
              </div>
            )}
            {!this.state.morePhotos && (
              <div>{"No more photos at this time."}</div>
            )}
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  console.log("LABELING CONTENT STATE", state);
  let newProps = {};
  newProps.username = state.auth.username;
  newProps.email = state.auth.email;
  newProps.token = state.auth.token;
  newProps.logged_in = state.auth.success === 1;
  newProps.signed_up = false;
  newProps.image = state.updateImage.image;
  newProps.imageid = state.updateImage.imageid;
  console.log("NEW PROPS", newProps);
  return newProps;
};
const mapDispatchToProps = dispatch => {
  return {
    dispatch
  };
};

Labeling = connect(mapStateToProps, mapDispatchToProps)(Labeling);
export default withRouter(Labeling);
