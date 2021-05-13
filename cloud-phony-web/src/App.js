import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Input from "react-phone-number-input/input";

import IconButton from "@material-ui/core/IconButton";
import CallIcon from "@material-ui/icons/Call";
import MenuIcon from "@material-ui/icons/Menu";
import Plivo from "plivo-browser-sdk";
import {
  Box,
  Container,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { isValidPhoneNumber } from "react-phone-number-input";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const convertSecondsToHourMinSecFormat = (timeInSeconds) => {
  let measuredTime = new Date(null);
  measuredTime.setSeconds(timeInSeconds); // specify value of SECONDS
  let MHSTime = measuredTime.toISOString().substr(14, 5);
  return MHSTime;
};

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      console.log("stream"); // C
    })
    .catch((err) => {
      console.log("u got an error:" + err);
    });
}

const options = {
  debug: "DEBUG",
  permOnClick: true,
  enableTracking: true,
  closeProtection: true,
  maxAverageBitrate: 48000,
};
const plivoBrowserSdk = new Plivo(options);

export default function ButtonAppBar() {
  const classes = useStyles();

  const [inCall, setInCall] = useState(false);

  const [callTimer, setCallTimer] = useState(300);
  const [callTimerInMins, setCallTimerInMins] = useState(5);
  const [callTimerInterval, setCallTimerInterval] = useState(null);

  const [name, setName] = useState("");
  const [sourceNumber, setSourceNumber] = useState("");
  const [destinationNumber, setDestinationNumber] = useState("");

  useEffect(() => {
    getLocalStream();
    initPlivo();
  }, []);

  useEffect(() => {
    if (callTimer <= 0) {
      disconnectCall();
      clearInterval(callTimerInterval);
    }
  }, [callTimer]);

  const initPlivo = () => {
    function onWebrtcNotSupported() {
      console.warn("no webRTC support");
      alert(
        "Webrtc is not supported in this broswer, Please use latest version of chrome/firefox/opera/IE Edge"
      );
    }

    function onLogin() {
      console.log("Successfully Logged In!")
    }

    function onLoginFailed(reason) {
      console.info("onLoginFailed ", reason);
      if (Object.prototype.toString.call(reason) == "[object Object]") {
        reason = JSON.stringify(reason);
      }
    }

    function onCalling() {
      console.info("onCalling");
    }

    function onCallRemoteRinging(callInfo) {
      if (callInfo) console.log(JSON.stringify(callInfo));
      console.info("onCallRemoteRinging");
    }

    function onCallAnswered(callInfo) {
      console.log("The person answer the phone", callInfo);
    }

    function onCallTerminated(evt, callInfo) {
      if (!plivoBrowserSdk) {
        return;
      }
      console.info(`onCallTerminated ${evt}`);
      if (
        callInfo &&
        callInfo.callUUID === plivoBrowserSdk.client.getCallUUID()
      ) {
        console.info(JSON.stringify(callInfo));
      }
    }

    function onCallFailed(reason, callInfo) {
      if (callInfo) {
        console.log(JSON.stringify(callInfo));
        console.info(
          `onCallFailed ${reason} ${callInfo.callUUID} ${callInfo.direction}`
        );
      } else {
        console.info(`onCallFailed ${reason}`);
      }
    }

    function onMediaPermission(evt) {
      console.info("onMediaPermission", evt);
      if (evt.error) {
        console.log("Media Permission Failed");
      }
    }

    plivoBrowserSdk.client.on("onWebrtcNotSupported", onWebrtcNotSupported);
    plivoBrowserSdk.client.on("onLogin", onLogin);
    plivoBrowserSdk.client.on("onLoginFailed", onLoginFailed);
    plivoBrowserSdk.client.on("onCallRemoteRinging", onCallRemoteRinging);
    plivoBrowserSdk.client.on("onCallFailed", onCallFailed);
    plivoBrowserSdk.client.on("onCallAnswered", onCallAnswered);
    plivoBrowserSdk.client.on("onCallTerminated", onCallTerminated);
    plivoBrowserSdk.client.on("onCalling", onCalling);
    plivoBrowserSdk.client.on("onMediaPermission", onMediaPermission);

    plivoBrowserSdk.client.login("shan2new31923604084323949217", "Tmasds@@930");
  };

  const createCallMetaAPICall = (callMeta) => {
    console.log("callMeta", callMeta);
    fetch("http://localhost:4000/api/v1/callmeta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callMeta),
    })
      .then((res) => {
        console.log("Result", res);
        if (res.status > 300) {
          console.log("Failed to create CallMeta");
          return null;
        }
        return res.json();
      })
      .then((res) => {
        if (res) {
          console.log("Successfully created CallMeta", res);
        }
      })
      .catch((err) => {
        console.log("Failed to create CallMeta", err);
      });
  };

  const initiateCall = () => {
    if (!isValidPhoneNumber(sourceNumber)) {
      alert("Please check the source number");
      return;
    }

    if (!isValidPhoneNumber(destinationNumber)) {
      alert("Please check the destination number");
      return;
    }

    setInCall(true);
    setCallTimer(callTimerInMins * 60);
    const callTimerIntervalNew = setInterval(() => {
      setCallTimer((callTimer) => callTimer - 1);
    }, 1000);
    setCallTimerInterval(callTimerIntervalNew);

    let extraHeaders = {},
      customCallerId = sourceNumber,
      to = destinationNumber;
    if (customCallerId) {
      customCallerId = customCallerId.replace("+", "");
      extraHeaders = { "X-PH-callerId": customCallerId };
    }
    extraHeaders["X-PH-conference"] = "true";
    extraHeaders["X-PH-Header1"] = sourceNumber;
    extraHeaders["X-PH-header1"] = sourceNumber;
    extraHeaders["callerId"] = sourceNumber;
    if (!to || !plivoBrowserSdk) {
      return;
    }
    if (!plivoBrowserSdk.client.isLoggedIn) {
      alert("Something failed! Please reload the page and try again!");
    }
    plivoBrowserSdk.client.call(to, extraHeaders);
  };

  const disconnectCall = () => {
    createCallMetaAPICall({
      name: name,
      srcPhoneNumber: sourceNumber,
      desPhoneNumber: destinationNumber,
      selectedDuration: callTimerInMins * 60,
      actualDuration: callTimerInMins * 60 - callTimer,
    });
    setCallTimer(500);
    setInCall(false);
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
      setCallTimerInterval(null);
    }
    plivoBrowserSdk.client.hangup();
  };

  const renderCallStartScreen = () => {
    return (
      <Container>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          style={{ marginTop: "50px", width: "100%" }}
        >
          <FormGroup style={{ width: "500px" }}>
            <FormControl>
              <TextField
                id="name"
                label="Name"
                variant="outlined"
                onChange={(e) => {
                  setName(e.target.value.trim());
                }}
              />
            </FormControl>
            <FormControl style={{ marginTop: 10 }}>
              <TextField
                autoFill
                id="phone-number"
                label="Source(Your) Phone Number / Caller ID"
                variant="outlined"
                onChange={(e) => {
                  setSourceNumber(e.target.value.trim());
                }}
              />
            </FormControl>
            <FormControl style={{ marginTop: 10 }}>
              <TextField
                autoFill
                id="phone-number-des"
                label="Destination Phone Number"
                variant="outlined"
                onChange={(e) => {
                  setDestinationNumber(e.target.value.trim());
                }}
              />
            </FormControl>
            <FormControl style={{ marginTop: 10 }}>
              <InputLabel id="duration">Duration(mins)</InputLabel>
              <Select
                labelId="duration"
                id="duration-select"
                value={callTimerInMins}
                variant="outlined"
                onChange={(e) => setCallTimerInMins(e.target.value)}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                style={{
                  background: "#4BB543",
                  color: "WHITE",
                  width: "50px",
                  height: "50px",
                }}
                onClick={() => {
                  initiateCall();
                }}
              >
                <CallIcon />
              </IconButton>
            </FormControl>
          </FormGroup>
        </Box>
      </Container>
    );
  };

  const renderCallScreen = () => {
    // Call Timer at the Top
    return (
      <Box
        justifyContent="center"
        alignItems="center"
        style={{ width: "100%" }}
        display="flex"
        flexDirection="column"
      >
        <div style={{ fontFamily: "Poppins", fontWeight: "700", fontSize: 88 }}>
          {convertSecondsToHourMinSecFormat(callTimer)}
        </div>
        <IconButton
          style={{
            background: "#B00020",
            color: "WHITE",
            width: "80px",
            height: "80px",
            marginTop: 20,
          }}
          onClick={() => {
            disconnectCall();
          }}
        >
          <CallIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Cloud Phony
          </Typography>
        </Toolbar>
      </AppBar>
      {!inCall ? renderCallStartScreen() : renderCallScreen()}
    </div>
  );
}
