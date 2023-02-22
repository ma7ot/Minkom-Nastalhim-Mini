import { useState, useEffect, useContext, useRef } from "react";
import Router from "next/router";
import { ColorRing } from 'react-loader-spinner'

import 'react-phone-number-input/style.css'
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input'
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import AlertTitle from '@mui/material/AlertTitle';
import Link from "next/link";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { RegisterUser, VerifyUser } from "../lib/auth";
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Typography from '@material-ui/core/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@material-ui/core/Box';

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ fullname: '', studentID: '', univeristy: '' });

  const [errMsgs, seterrMsgs] = useState([]);


  var userInfoRef = useRef()
  userInfoRef.current = userInfo


  const [userPhone, setUserPhone] = useState('');
  var userPhoneRef = useRef()
  userPhoneRef.current = userPhone


  function resetInputs(){
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

  async function handleRegister() {
    //setIsLoading(true);
    seterrMsgs([])
    const verify = await verifyUser();
    console.log('verify', verify)
    if (verify.status == false) {
      seterrMsgs(verify.msgs)
      setIsLoading(false);
      return;
    }

    const data = {
      user: userInfoRef.current,
      //bizz: bizzInfoRef.current,
      phone: userPhoneRef.current,
      //bizzPhone: userPhoneRef.current,
    }
    //setIsLoading(true);
    console.log('data', data)
    try {
      //setIsLoading(true);
      // API call:
      const res = await RegisterUser(data);
      console.log("res :", res);
      if (res.set == true) {
        setIsLoading(true);
        setConfirmation(true)
        setTimeout(()=>{
          setConfirmation(false)
        }, 7000)
        resetInputs()
        handleClick()
      } else {
        setIsLoading(false);
        handleClickFail()
      }
    } catch (error) {
      console.log(error);
      handleClickFail()
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
          Registration successfull!
        </Alert>
      </Snackbar>

      <Snackbar open={openFail} autoHideDuration={6000} onClose={handleCloseFail}>
        <Alert onClose={handleCloseFail} severity="error" sx={{ width: '100%' }}>
          Registration failed!
        </Alert>
      </Snackbar>
      <form className="" style={{ width: '600px' }}>
        <fieldset>
          {confirmation == true ?
            <Box style={{ display: "flex", alignItems: "center", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
              <CheckCircleIcon sx={{ mr: 1, color: 'green' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} style={{ fontWeight: 'bold' }}>
                You registration was successfull
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} style={{ textAlign: 'center' }}>
                Please proceed to our counter to validate your registration
              </Typography>
            </Box>
            :
            <>
              <h4 className="h1 w-100">Register</h4>
              {errMsgs.length > 0 ?

                <Stack sx={{ width: '100%' }} spacing={2}>
                  <Alert className='checkoutErr' severity="error">
                    <AlertTitle>Error!</AlertTitle>
                    <ul style={{ listStyleType: 'disclosure-closed', marginLeft: '20px' }}>
                      {errMsgs.map((val, idx) =>
                        <li key={idx} style={{ marginBottom: '5px' }}>{val}</li>
                      )}
                    </ul>
                  </Alert>
                </Stack>
                : ''}

              <h5 style={{ display: 'block', width: '100%', textAlign: 'start', margin: '20px 0px', fontWeight: '700', fontSize: '18px' }}>Your information</h5>
              <div className="mb-3 w-100">
                <label htmlFor="usernameInput" className="form-label">
                  Fullname
                </label>
                <input
                  type="text"
                  id="usernameInput"
                  className="form-control w-100"
                  placeholder="Fullname"
                  name="fullname"
                  onChange={(e) => handleUserInfo(e)}
                  value={userInfo.fullname}
                />
              </div>
              <div className="mb-3 w-100">
                <label htmlFor="usernameInput" className="form-label">
                  Student ID
                </label>
                <input
                  type="text"
                  id="usernameInput"
                  className="form-control w-100"
                  placeholder="Student ID"
                  name='studentID'
                  onChange={(e) => handleUserInfo(e)}
                  value={userInfo.studentID}

                />
              </div>
              <div className="mb-3 w-100">
                <label htmlFor="usernameInput" className="form-label">
                  University name
                </label>
                <input
                  type="text"
                  id="usernameInput"
                  className="form-control w-100"
                  placeholder="University name"
                  name='univeristy'
                  onChange={(e) => handleUserInfo(e)}
                  value={userInfo.univeristy}

                />
              </div>
              <div className="mb-3 w-100">
                <label htmlFor="passwordInput" className="form-label">
                  Phone
                </label>
                <PhoneInput
                  //error={userPhone && !isPossiblePhoneNumber(userPhone) ? 'true' : 'false'}
                  international
                  defaultCountry="OM"
                  placeholder="Phone number"
                  name="phone"
                  value={userPhone}
                  onChange={setUserPhone}
                  style={{ fontSize: '12px', padding: '10px 4px', width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <button type="button" onClick={handleRegister} className="btn btn-primary" disabled={isLoading}>
                  Register
                </button>
              </div>

            </>
          }

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
