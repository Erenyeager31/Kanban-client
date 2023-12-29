import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { WSContext } from '../../context/Workspace';
import { useNavigate } from 'react-router-dom';
//eslint-disable-next-line
import { Modal } from 'react-bootstrap';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'bootstrap/dist/css/bootstrap.css';
import '../../static/dashboard.css'
import ReactModal from 'react-modal';
axios.defaults.withCredentials = true
axios.defaults.baseURL = 'https://kanban-board-fg6l.onrender.com/api/';

export default function Dashboard() {
    const navigate = useNavigate()

    //todo --> consuming the context
    //eslint-disable-next-line
    const { ws_id, setWs_id } = useContext(WSContext)

    //* arrow functions for the modal
    // const [showModal, setShowModal] = useState(false);
    // // Function to open the modal
    // const openModal = () => setShowModal(true);
    // // Function to close the modal
    // const closeModal = () => setShowModal(false);

    const [userdetails, setDetails] = useState({
        name: "",
        email: ""
    })
    const [service, setService] = useState("Request to Join Workspace")
    const [d_left, setd_left] = useState('block')
    const [d_right, setd_right] = useState('none')
    const [searchbar, setSearchBar] = useState()
    const [searchResult, setResult] = useState()
    const [o_workspace, setmyOworkspace] = useState()
    const [j_workspace, setmyJworkspace] = useState()
    const [request, setRequests] = useState([
        1, 2, 3, 4, 5, 6
    ])


    sessionStorage.setItem("userFlag", false)

    useEffect(() => {
        update_credentials()
        fetch_workspace()
        fetchRequests()
    }, [])

    async function update_credentials() {
        // alert("inside")
        const status = sessionStorage.getItem("userFlag")
        if (status === 'false') {
            const response = await fetch('https://kanban-board-fg6l.onrender.com/api/Auth/fetchUser', {
                method: "POST", 
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "authtoken": sessionStorage.getItem("authtoken")
                }
            })
            // alert("hi")
            const json = await response.json()
            if (json.success) {
                sessionStorage.setItem("name", json.name)
                sessionStorage.setItem("email", json.email)
            } else {
                // alert(json.message)
            }
            sessionStorage.setItem("userFlag", true)
            setDetails({
                name: sessionStorage.getItem("name"),
                email: sessionStorage.getItem("email")
            })
        }
        // alert("outside")
    }

    const changeview = (e) => {
        var element = document.getElementById('switch_button');
        // var d_left = document.getElementsByClassName('d_left')
        // var d_right = document.getElementsByClassName('d_right')
        // console.log(d_left)
        if (element.className === 'joined') {
            element.className = 'request'
            setService('View Joined Workspace')
            setd_left('none')
            setd_right('block')
        } else {
            element.className = 'joined'
            setService('Request to Join Workspace')
            setd_left('block')
            setd_right('none')
        }
    }

    const fetch_workspace = async (e) => {
        axios.post('WS/fetchWS', {
            // withCredentials:true
        }).then((data) => {
            // console.log(data.data.workspace)
            setmyOworkspace(data.data.workspace.o_workspace)
            setmyJworkspace(data.data.workspace.j_workspace)
        }).catch((err) => {
            // alert("Unable to fetch the data")
        })
    }

    //! handler for the form
    const findByName = (e) => {
        e.preventDefault()
        // console.log(searchbar)
        if (!searchbar.length) {
            setSearchBar("-")
        }

        const searchQuery = {
            "query": searchbar
        }

        //* parameter 1 for name
        axios.post('WS/fetchSearch?id=1',
            searchQuery,
            {
            }).then((data) => {
                // console.log(data.data)
                if (data.data.success) {
                    setResult(data.data.result)
                } else {
                    alert(data.data.message)
                }
            }).catch((e) => {
                console.log(e)
            })
    }

    const findByID = (e) => {
        e.preventDefault()
        // console.log(searchbar)
        const searchQuery = {
            "query": searchbar
        }

        axios.post('WS/fetchSearch?id=2',
            searchQuery,
            {
            }).then((data) => {
                // console.log(data.data)
                if (data.data.success) {
                    setResult(data.data.result)
                } else {
                    alert(data.data.message)
                }
            }).catch((e) => {
                console.log(e)
            })
    }

    //! request mail to join the workspace
    const sendRequest = (e, ws_id) => {
        e.preventDefault()
        // alert(ws_id)

        axios.post("WS/joinwsReq", { ws_id })
            .then((data) => {
                alert(data.data.message)
            })
    }

    //! opening the desired workspace
    const openWorkspace = (e, ws_id, key, letter) => {
        e.preventDefault()
        //? whenever a request comes, simply save the ws_id in the redux or state 
        //? and access the ws_id on the routed page to fetch the required information 
        //* using context
        setWs_id(ws_id)
        sessionStorage.setItem("ws_id", ws_id)
        navigate("/board")
    }

    //! accept and reject the requests
    const acceptRequest = (e,ws_id,from_email) => {
        axios.post('WS/acceptRequest',
        {
            "ws_id":ws_id,
            "email":from_email,
            "permission":true
        }).then((response)=>{
            if(response.data.success){
                alert(response.data.message)
            }else{
                alert(response.data.message)
            }
        })
    }

    const rejectRequest = (e) => {
        e.preventDefault()
        // alert("hi")
    }

    const [customModalVisible, setCustomModalVisible] = useState(false);

    // Function to open the custom modal
    const openCustomModal = () => setCustomModalVisible(true);

    // Function to close the custom modal
    const closeCustomModal = () => setCustomModalVisible(false);

    // JSX for the content of the custom modal
    const customModalContent = (
        <div className="custom-modal-content">
            {/* Modal Header */}
            <div className="custom-modal-header">
                <h2>Pending Requests</h2>
            </div>

            {/* Modal Body */}
            <div className="custom-modal-body">
                {request.map((item, key) => {
                    return <div className="list" key={key}>
                        <div id="project_name"> {item.ws_id} </div>
                        <div id="owner" style={{ color: "#ff4a1c" }}> {item.name} </div>
                        {item.permission ? (
                            <>
                                Permission already accepted
                            </>
                        ) : (
                            <>
                                {/* Permission already denied */}
                                <button id='action' > <i class="fa-regular fa-circle-xmark"></i> </button>
                                <button id='action_tick' onClick={(e)=>{acceptRequest(e,item.ws_id,item.from_email)}}> <i class="fa-regular fa-circle-check"></i> </button>
                            </>
                        )}
                    </div>
                })}
            </div>

            {/* Modal Footer */}
            <div className="custom-modal-footer">
                <button onClick={closeCustomModal}>Close Modal</button>
            </div>
        </div>
    );

    //! modal for creation of workspace
    const [CreateWSModalVisible, setCreateWSModalVisible] = useState(false);

    // Function to open the CreateWS modal
    const openCreateWSModal = () => setCreateWSModalVisible(true);

    // Function to close the CreateWS modal
    const closeCreateWSModal = () => setCreateWSModalVisible(false);

    const CreateWSContentModal = (
        <div className="custom-modal-content">
            {/* Modal Header */}
            <div className="custom-modal-header">
                <h2>Create Workspace</h2>
            </div>
            {/* Modal Body */}
            <div className="custom-modal-body">
                <form action="" className='addnewform' style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "2%",
                    justifyContent: "center",
                    alignContent: "center"
                }}>
                    <h3
                        style={{
                            width: "100%",
                            textAlign: "center",
                            textTransform: "capitalize"
                        }}
                    >  </h3>
                    <input type="text" className="ws_name" name='ws_name' placeholder='Workspace Name'/>
                    {/* <input type="text" className="content_input" name='content' placeholder='Content' /> */}
                </form>
            </div>

            {/* Modal Footer */}
            <div className="custom-modal-footer" style={{
                display: "flex",
                justifyContent: "space-between"
            }}>
                <button onClick={closeCreateWSModal}>Close Modal</button>
                <button onClick={(e) => {
                    const data = {
                        project_name : document.querySelector('.ws_name').value
                    }
                    axios.post('WS/createWS',
                        data,
                    ).then((response) => {
                        if (response.data.success) {
                            alert("Workspace Created successfully")
                            closeCreateWSModal()
                        } else {
                            alert("Unable to add, please try again")
                        }
                    })
                }}
                >Submit</button>
            </div>
        </div>
    );

    const fetchRequests = () => {
        axios.post('WS/fetchRequests',
            {
            }).then((data) => {
                if (data.data.success) {
                    setRequests(data.data.request_list)
                    // console.log(data.data.request_list)
                } else {
                    alert(data.data.message)
                }
            }).catch((e) => {
                console.log(e)
            })
    }

    return (
        <div className='container'>
            <header>
                Welcome {userdetails.name}
            </header>
            <div onClick={changeview} className="joined" id='switch_button'>
                <div className='htag'>{service}</div>
                <div className="box"></div>
            </div>
            <div className="dashboard">
                <div className="d_left" style={{ display: d_left, transition: "Opacity 2s ease-in" }}>
                    <h3 className="joined_ws">JOINED WORKSPACE</h3>
                    <div className="info_area">
                        <div className="ws_list">
                            <div className="head">
                                <div className="project_name"> Project Name </div>
                                <div className="owner"> Created By </div>
                                <div className='action'> Leave </div>
                            </div>

                            {(o_workspace && o_workspace.map((item, key) => {
                                return <div className="list" onClick={(e) => { openWorkspace(e, item.ws_id, key, 'O') }} key={item.ws_id}>
                                    <div id="project_name"> {item.project_name} </div>
                                    <div id="owner" style={{ color: "#ff4a1c" }}> {item.leader_name}(you) </div>
                                    {/* <div id='action'> <i class="fa-solid fa-ban"></i> </div> */}
                                </div>
                            })) || 'You have not Create any of your own Workspace'}
                            {(j_workspace && j_workspace.map((item, key) => {
                                return <div className="list" onClick={(e) => { openWorkspace(e, item.ws_id, key, 'J') }} key={item.ws_id}>
                                    <div id="project_name"> {item.project_name} </div>
                                    <div id="owner"> {item.leader_name} </div>
                                    <div id='action'> <i className="fa-solid fa-ban"></i> </div>
                                </div>
                            })) || 'You have not joined any Workspace, yet'}
                        </div>
                    </div>
                </div>
                <div className="d_right" style={{ display: d_right, transition: "Opacity 2s ease-in" }}>
                    <h3 className="request_ws">REQUEST TO JOIN WORKSPACE</h3>
                    <div className="join_area">
                        <div className="search_area">
                            <form action="">
                                <input type="text" placeholder='Enter the Workspace Name or ID' onChange={(e) => {
                                    setSearchBar(e.target.value)
                                }}
                                    required
                                />
                                <button type="submit" onClick={findByName}>Find By Name</button>
                                <button type="submit" onClick={findByID}>Find By Workspace ID  </button>
                            </form>
                        </div>
                        <div className="result_area">
                            <h3>Search Result</h3>
                            <div className="result">
                                <div className="head">
                                    <div className="project_name"> Project Name </div>
                                    <div className="owner"> Created By </div>
                                    <div className='action'> Join </div>
                                </div>

                                {
                                    (searchResult && searchResult.map((item, key) => {
                                        return <div className="list" key={key}>
                                            <div id="project_name"> {item.project_name} </div>
                                            <div id="owner"> {item.leader_name} </div>
                                            <div id='join' onClick={(e) => { sendRequest(e, item.ws_id) }}> <i className="fa-regular fa-envelope"></i> </div>
                                        </div>
                                    })) ||
                                    'Please enter a valid Workspace name or ID'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button type='button' className="request_b" onClick={openCustomModal}>
                <h1>R</h1>
            </button>
            <ReactModal
                isOpen={customModalVisible}
                onRequestClose={closeCustomModal}
                contentLabel='Custom Modal'
                className='custom-modal'
                overlayClassName='custom-modal-overlay'
            >
                {customModalContent}
            </ReactModal>
            <button type='button' className="create" onClick={openCreateWSModal}>
                <h1>+</h1>
            </button>
            <ReactModal
                isOpen={CreateWSModalVisible}
                onRequestClose={closeCreateWSModal}
                contentLabel='Custom Modal'
                className='custom-modal'
                overlayClassName='custom-modal-overlay'
            >
                {CreateWSContentModal}
            </ReactModal>
        </div>
    )
}
