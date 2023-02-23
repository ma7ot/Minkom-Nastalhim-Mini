import { useState, useEffect, useContext, useRef } from "react";
import Router from "next/router";
import { ColorRing } from 'react-loader-spinner'
import { loginUser } from "../lib/auth";

import 'react-phone-number-input/style.css'
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input'
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import AlertTitle from '@mui/material/AlertTitle';
import Link from "next/link";
import { removeToken } from "../lib/token";

import { RegisterUser, VerifyUser } from "../lib/auth";
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Typography from '@material-ui/core/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@material-ui/core/Box';

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    // Remove the User's token which saved before.
    removeToken();
  }, []);

  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ username: '', password: '' });

  const [errMsgs, seterrMsgs] = useState([]);


  var userInfoRef = useRef()
  userInfoRef.current = userInfo


  const [userPhone, setUserPhone] = useState('');
  var userPhoneRef = useRef()
  userPhoneRef.current = userPhone


  function resetInputs() {
    setUserInfo({ fullname: '', studentID: '', univeristy: '' })
    setUserPhone('')
  }
  function handleUserInfo(e) {

    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    console.log('userInfo', userInfo)
    console.log('userPhone', userPhone)

  }, [userInfo, userPhone])

  async function verifyUser() {
    var res = {
      status: true,
      msgs: []
    }

    if (userInfoRef.current.fullname == '' || userInfoRef.current.studentID == '' || userInfoRef.current.univeristy == '' || userPhoneRef.current == '') {
      res.status = false;
      res.msgs.push('All fields are required')
    }

    if (userInfoRef.current.fullname.length < 5) {
      res.status = false;
      res.msgs.push('Name must be at least 5 characters')
    }

    if (!isPossiblePhoneNumber(userPhoneRef.current)) {
      res.status = false;
      res.msgs.push('Invalid phone number')
    }
    var phoneCheck = await VerifyUser({ fetch: "checkPhoneAvailability", phone: userPhoneRef.current })

    if (phoneCheck.ok == false) {
      res.msgs.push('Phone server error')
      res.status = false
    }

    if (phoneCheck.data && phoneCheck.data > 0) {
      res.msgs.push('Phone number is already used')
      res.status = false
    }
    return res;
  }

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const [openFail, setOpenFail] = useState(false);

  const handleClickFail = () => {
    setOpenFail(true);
  };

  const handleCloseFail = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenFail(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    const isQrlix = 1;

    try {
      setIsLoading(true);
      // API call:
      const data = await loginUser(userInfo.username, userInfo.password, isQrlix);
      // console.log("Data is :", data);
      // console.log("Payload is :" , data.payload);
      // console.log("Token is :" , data.payload.token);
      if (data.payload && data.payload.token) {
        handleClick()
        if (rememberMe) {
          window.localStorage.setItem("token", data.payload.token);
        } else {
          window.sessionStorage.setItem("token", data.payload.token);
        }
        setTimeout(() => {
          Router.push("/");
        }, 300);

      } else {
        setErrorMessage(data.message);
        handleClickFail()
      }
    } catch (error) {
      handleClickFail()
      setErrorMessage(error);

      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const passRef = useRef();
  const [passShow, setPassShow] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  function togglePass() {
    if (passRef.current.type === "password") {
      passRef.current.type = "text";
      setPassShow(true)
    } else {
      passRef.current.type = "password";
      setPassShow(false)

    }
  }

  return (
    <div className="formBox flex middle-pos" >
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Login successfull!
        </Alert>
      </Snackbar>

      <Snackbar open={openFail} autoHideDuration={6000} onClose={handleCloseFail}>
        <Alert onClose={handleCloseFail} severity="error" sx={{ width: '100%' }}>
          Login failed! Check your credentials
        </Alert>
      </Snackbar>
      <form className="" style={{ width: '600px' }}>
        <fieldset>
          <>
            <h4 className="h1 w-100">Admin login</h4>
            {errorMessage != '' ?

              <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert className='checkoutErr' severity="error">
                  <AlertTitle>Error!</AlertTitle>
                  <ul style={{ listStyleType: 'disclosure-closed', marginLeft: '20px' }}>
                      <li style={{ marginBottom: '5px' }}>{errorMessage}</li>
                  </ul>
                </Alert>
              </Stack>
              : ''}

            <div className="mb-3 w-100">
              <label htmlFor="usernameInput" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="usernameInput"
                className="form-control w-100"
                placeholder="Username"
                name="username"
                onChange={(e) => handleUserInfo(e)}
                value={userInfo.fullname}
              />
            </div>
            <div className="mb-3 w-100">
              <label htmlFor="usernameInput" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="usernameInput"
                className="form-control w-100"
                placeholder="Password"
                name='password'
                onChange={(e) => handleUserInfo(e)}
                value={userInfo.studentID}

              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={isLoading}>
                Login
              </button>
            </div>

          </>


          <Link href="/auth/login">
            <div style={{ color: '#c150cc', cursor: 'pointer', marginTop: '15px' }}></div>
          </Link>

          {isLoading == true ?
            <div className="loader">
              <ColorRing
                visible={true}
                height="80"
                width="80"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={['#E15BCF', '#EAD1A2', '#F86A6A', '#81BDB6', '#9B8984']}
              />
            </div>
            : ""}

        </fieldset>


      </form>
    </div>
  );
}
