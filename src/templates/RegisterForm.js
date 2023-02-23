import { useState, useEffect, useContext, useRef } from "react";
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

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import storage from "../lib/bucket"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { whoAmI } from "../lib/auth";
import Router, { useRouter } from "next/router";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()

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

  const [saving, setSaving] = useState(null);
  const [newUrl, setNewUrl] = useState("");
  const [images, setImages] = useState(null);
  const [imageDisplay, setImageDisplay] = useState(null);
  const [percent, setPercent] = useState(0);
  const [isVodaphone, setIsVodaphone] = useState(true);

  var newUrlRef = useRef()
  newUrlRef.current = newUrl


  const [user, setUser] = useState(null);

  async function cookieFetch() {
    const token = window.localStorage.getItem("token") || window.sessionStorage.getItem("token");
    console.log(token)
    if (!token) {
      redirectToLogin();
      setUser(null);
    } else {
      (async () => {
        try {
          const data = await whoAmI();
          console.log('data', data)

          if (data.error === "Unauthorized") {
            // User is unauthorized and there is no way to support the User, it should be redirected to the Login page and try to logIn again.
            redirectToLogin();
            setUser(null);
          } else {
            var result = Object.values(data.payload);
            setUser(data.payload);
            console.log('data.payloaddata.payload', data.payload)
          }
        } catch (error) {
          // If we receive any error, we should be redirected to the Login page
          redirectToLogin();
          setUser(null);
        }
      })();
    }
  }
  // Watchers

  useEffect(() => {
    cookieFetch();
  }, [router.pathname]);


  function redirectToLogin() {
    Router.push("/login");
  }



  function resetInputs() {
    setUserInfo({ fullname: '', studentID: '', univeristy: '', univeristySelect: '' })
    setUserPhone('')
    setImageDisplay(null)
    setImages(null)
    setIsVodaphone(true)
    setPercent(0)
    seterrMsgs([])
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

    if (userInfoRef.current.fullname == '' || userInfoRef.current.studentID == '' || userInfoRef.current.univeristySelect == '' || userPhoneRef.current == '') {
      res.status = false;
      res.msgs.push('Some fields are required')
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
      img: newUrlRef.current,
      isVodaphone: isVodaphone
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
        setTimeout(() => {
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
  const [uploading, setUploading] = useState(false);


  function handleChange(event) {
    if(uploading == true){
      seterrMsgs([...errMsgs, 'Upload in progress, please wait! '])

      return;
    }
    if (userInfo.studentID == '' || userInfo.studentID == null) {
      seterrMsgs([...errMsgs, 'Insert the student ID number first'])
      return;
    }

    if (!event.target.files[0] || !URL) return;

    setImages(event.target.files[0])
    setImageDisplay(URL.createObjectURL(event.target.files[0]))
    console.log('event.target.files[0]', event.target.files[0])
    handleUpload(event.target.files[0], false)
  }

  function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const handleUpload = async (file, update) => {
    if (!file) {
      return
    }
    var rand;

    setUploading(true)

    const storageRef = ref(storage, `/projects/Nastalhim/ID-${userInfo.studentID}`);

    // progress can be paused and resumed. It also exposes progress updates.
    // Receives the storage reference and the file to upload.
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // update progress
        setPercent(percent);
      },
      (err) => {
        setUploading(false)

        console.log(err)
      },
      () => {
        // download url
        setUploading(false)

        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          console.log(url);
          setNewUrl(url)

        });
      }
    );
  };

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


                <div className="mb-3 w-100">
                  <label htmlFor="usernameInput" className="form-label">
                    University
                  </label>
                  <select name='univeristySelect' id="options" onChange={(e) => handleUserInfo(e)}
                    value={userInfo.univeristySelect} className="form-control w-100">
                    <option value="">--Please choose an option--</option>
                    <option value="Sultan Qaboos University">Sultan Qaboos University</option>
                    <option value="Nizwa University">Nizwa University</option>
                    <option value="Sohar University">Sohar University</option>
                    <option value="GUtech">GUtech</option>
                    <option value="University of Technology and Applied Science">University of Technology and Applied Science</option>

                    <option value={0}>Other</option>

                  </select>
                </div>
                {userInfo.univeristySelect == 0 ?
                  <div className="mb-3 w-100">
                    <label htmlFor="usernameInput" className="form-label">
                      Enter The University's name
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
                  </div> : ''
                }
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
                    Student ID Photo
                  </label>
                </div>
                <div className='image-row'>
                  <span>
                    <input style={{ color: 'black', minWidth: '100%' }} type="file" accept="/image/*" onChange={handleChange} />
                    {percent == 0 ? '' :
                      <span className="load-up"><p style={{ width: percent + "%" }}></p></span>
                    }
                    {percent == 100 ? <> <CheckCircleOutlineOutlinedIcon /> Upload success</> : ''}
                  </span>
                  <div><img style={{ width: '60%' }} src={imageDisplay != null ? imageDisplay : ''} /></div>
                </div>
              </div>

              <div className="mb-3 w-100">
                <FormControlLabel style={{ margin: '15px 0px 10px' }} control={<Switch defaultChecked={isVodaphone} onChange={() => setIsVodaphone(!isVodaphone)} value={isVodaphone} />} label="Vodaphone account holder?" />

                {isVodaphone == true ? <p style={{ color: 'brown' }}>**Vodaphone holder are eligable for 3 books</p> :
                  <p style={{ color: 'brown' }}>**Non Vodaphone holder are eligable for 3 books</p>}
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
