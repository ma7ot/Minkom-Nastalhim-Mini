import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    TablePagination,
} from '@material-ui/core';
import { apiFetch } from "../lib/fetch";
import Router, { useRouter } from "next/router";
import { whoAmI } from "../lib/auth";
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { Grid } from '@material-ui/core';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px',
        borderRadius: '5px',
    },
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const ListTable = () => {

    const router = useRouter()
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [students, setStudents] = useState([]);

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


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredData = students.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const slicedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    async function getStudents() {
        if (user == null) return;
        var students = await apiFetch({ fetch: "studentsList" })
        console.log(students)
        if (students.ok == true) {
            setStudents(students.data)
        }
    }

    useEffect(() => {
        getStudents()
    }, [user])



    return (
        <div className="formBox flex middle-pos" style={{ flexDirection: 'column' }}>

            <TextField id="search" label="Search" value={searchTerm} onChange={handleChange} />
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Info</TableCell>
                            <TableCell>Student ID</TableCell>
                            <TableCell>University/College</TableCell>
                            <TableCell>Books</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Info</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {slicedData.map((item, idx) => (
                            <CustomTableRow item={item} idx={idx} onRefresh={()=> getStudents()} />
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </div>
    );
};

const CustomTableRow = ({ item, idx, onRefresh }) => {
    const [open, setOpen] = React.useState(false);


    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => setOpen(false);

    const classes = useStyles();
    const [count, setCount] = useState(item.book_limit);
    const [countRec, setCountRec] = useState(item.book_received);

    const handleIncrement = () => {
        setCount((prevCount) => prevCount + 1);
    };

    const handleDecrement = () => {
        if (count > 0) {
            setCount((prevCount) => prevCount - 1);
        }
    };
    const handleIncrementRec = () => {
        setCountRec((prevCount) => prevCount + 1);
    };

    const handleDecrementRec = () => {
        if (countRec > 0) {
            setCountRec((prevCount) => prevCount - 1);
        }
    };

    async function handleApprove(){
        var students = await apiFetch({ fetch: "approveStudent", ID: item.id, limit: count })
        console.log(students)
        if (students.ok == true) {
            onRefresh()
            handleClose()
        }
    }
    async function handleUpdate(){
        var students = await apiFetch({ fetch: "updateStudent", ID: item.id, limit: count, rec: countRec })
        console.log(students)
        if (students.ok == true) {
            onRefresh()
            handleClose()
        }
    }
    return (
        <TableRow key={item.id}>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="p" component="p">
                        Student ID: {item.student_id}
                    </Typography>
                    <Typography id="modal-modal-title" variant="p" component="p">
                        Fullname: {item.name}
                    </Typography>
                    <Typography id="modal-modal-title" variant="p" component="p">
                        Phone ID: {item.phone}
                    </Typography>
                    <Typography id="modal-modal-title" variant="p" component="p">
                        Phone ID: {item.phone}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Books: {item.book_received} out of {item.book_limit}
                    </Typography>


                    {item.status == 0 ?
                        <>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                Set limit: set the book limit for this user
                            </Typography>
                            <div className={classes.root}>
                                <Grid container spacing={1} alignItems="center" style={{flexWrap: 'nowrap'}}>
                                    <Grid item>
                                        <Button className={classes.button} onClick={handleDecrement}>
                                            <RemoveCircleOutlineOutlinedIcon />
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            value={count}
                                            variant="outlined"
                                            margin="dense"
                                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button className={classes.button} onClick={handleIncrement}>
                                            <AddCircleOutlineOutlinedIcon />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                            <Button onClick={handleApprove} className="btn" style={{ color: 'white', marginTop: '20px' }}>Approve</Button>
                        </>
                        :
                        <>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                Set limit: set the book limit for this user
                            </Typography>
                            <div className={classes.root}>

                                <Grid container spacing={1} alignItems="center" style={{flexWrap: 'nowrap'}}>
                                    <Grid item>
                                        <Button className={classes.button} onClick={handleDecrement}>
                                            <RemoveCircleOutlineOutlinedIcon />
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            value={count}
                                            variant="outlined"
                                            margin="dense"
                                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button className={classes.button} onClick={handleIncrement}>
                                            <AddCircleOutlineOutlinedIcon />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                Books received: set the book received
                            </Typography>
                            <div className={classes.root}>
                                <Grid container spacing={1} alignItems="center" style={{flexWrap: 'nowrap'}}>
                                    <Grid item>
                                        <Button className={classes.button} onClick={handleDecrementRec}>
                                            <RemoveCircleOutlineOutlinedIcon />
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            value={countRec}
                                            variant="outlined"
                                            margin="dense"
                                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button className={classes.button} onClick={handleIncrementRec}>
                                            <AddCircleOutlineOutlinedIcon />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                            <Button onClick={handleUpdate} className="btn" style={{ color: 'white', marginTop: '20px' }}>Submit</Button>
                        </>
                    }

                </Box>
            </Modal>
            <TableCell component="th" scope="row">
                {item.id}
            </TableCell>
            <TableCell>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{item.name}</span>
                    <span>{item.phone}</span>
                </span>
            </TableCell>
            <TableCell>{item.student_id}</TableCell>
            <TableCell>{item.univeristy}</TableCell>
            <TableCell>{`${item.book_received}/${item.book_limit}`}</TableCell>
            <TableCell>
                {item.status === 0 ? (
                    <span>
                        <InfoOutlinedIcon style={{ width: '18', color: 'brown' }} /> Pending
                    </span>
                ) : (
                    <span>
                        <CheckCircleOutlinedIcon style={{ width: '18', color: 'green' }} /> Approved
                    </span>
                )}
            </TableCell>
            <TableCell>
                <IconButton aria-label="add an alarm" onClick={handleOpen}>
                    <InfoIcon style={{ color: 'blue' }} />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default ListTable; CustomTableRow;
