import React, { useContext, useEffect, useState } from 'react'
import '../screen.css'
import { WSContext } from '../context/Workspace'
import axios from 'axios'
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';
axios.defaults.withCredentials = true
axios.defaults.baseURL = 'https://kanban-board-fg6l.onrender.com/api/';

// const port = 
const WS_URL = 'wss://kanban-board-fg6l.onrender.com'
const message = {
  "JOIN": "join",
  "LEAVE": "leave",
  "UPDATE": "update",
}
const email = sessionStorage.getItem('email')
const username = sessionStorage.getItem('username')

export default function Kanban_board() {
  const navigate = useNavigate()
  //! setUsers
  const [users, setUsers] = useState([{}])

  //*manage web-socket operations
  const ws = new WebSocket(WS_URL)

  ws.addEventListener('open', () => {
    const data = {
      'type': message.JOIN,
      'user_data': { email, username }
    }
    ws.send(JSON.stringify(data));
  })

  ws.addEventListener('message', (event) => {
    const response_message = JSON.parse(event.data);
    // console.log('Received message:', response_message);

    if (response_message.type === message.LEAVE || response_message.type === message.JOIN) {
      // console.log(response_message.user_data)
      setUsers(response_message.user_data)
    }
    else if (response_message.type === message.UPDATE) {
      // console.log(response_message)
      if (response_message.message.split(" ")[0] !== sessionStorage.getItem("username")) {
        // console.log("Inside")
        let category = []
        if (response_message.category.length === 2) {
          if (response_message.category[0] === response_message.category[1]) {
            category = response_message.category[0]
          } else {
            category = response_message.category
          }
        } else {
          category = response_message.category
        }

        //! calling api to fetch new data
        axios.post('/BM/fetchMultipleCards',
          {
            ws_id: ws_id,
            category: category
          }
        ).then((response) => {
          // console.log(response.data)
          if (response.data.success) {
            if (response_message.data?.message.split(" ")[0] !== sessionStorage.getItem("username")) {
              // console.log("hi")
              const cards = response.data.cards
              for (let i in cards) {
                // category_models[cards[i]](cards[i])
                // console.log(i)
                category_models[i](cards[i])
              }
            }
          }
        })
      }
    }
  })

  useEffect(() => {

    window.addEventListener('pagehide', function () {
      // console.log("Page is closing...");
    });

    // Attach the WebSocket close listener directly
    if (ws.readyState === WebSocket.OPEN) {
      ws.addEventListener('close', () => {
        const data = {
          'type': message.LEAVE,
          'user_data': { email, username }
        };
        ws.send(JSON.stringify(data));
      });
    }
    fetchCards()
    //eslint-disable-next-line
  }, [])

  //! context
  //eslint-disable-next-line
  const { ws_id, setWs_id } = useContext(WSContext)

  //! state
  const [draggableID, setDraggable] = useState()
  //eslint-disable-next-line
  const [startcontainer, setContainer] = useState()
  const [card_id, setCardid] = useState()

  //!state for changing a cards input
  const [currentInput, setInput] = useState({
    category: "",
    title: "",
    content: ""
  })

  //eslint-disable-next-line  
  const [tasks, setTasks] = useState([])
  //eslint-disable-next-line
  const [underwork, setUnderwork] = useState([1])
  //eslint-disable-next-line
  const [completed, setCompleted] = useState([1])
  //eslint-disable-next-line
  const [testing, setTesting] = useState([1])
  //eslint-disable-next-line
  const [deployed, setDeployed] = useState([1])

  //! json for setter functions
  const category_models = {
    "tasks": setTasks,
    "underwork": setUnderwork,
    "completed": setCompleted,
    "testing": setTesting,
    "deployed": setDeployed
  }

  const handleDrag = (e, classname, card_id) => {
    // console.log(e.target.id)
    //? add a class --> draggable, this helps to know which element is dragged
    //* instead of taking id, access the element from the event e and then use the id from the element
    setDraggable(e.target.id)
    setContainer(classname)
    // console.log(card_id)
    setCardid(card_id)
  }

  const endDrag = (e) => {
    e.preventDefault()
  }

  const onDrop = (e, classname) => {
    try {
      //? access the element that was dragged
      const draggableElement = document.getElementById(draggableID)

      const children = draggableElement.children
      const title = children[0].value
      const content = children[1].value

      //? count number of child, to decide the new id for the dropeed element
      const key = document.querySelectorAll(`.${classname} > .list > div`).length

      //? change the id
      draggableElement.id = `${classname}${key}`

      //? making request through the api
      axios.post('BM/modifyCard', {
        "ws_id": ws_id,
        "category": classname,
        "card_id": card_id,
        "title": title,
        "content": content
      }).then((response) => {
        // console.log(response.data)
        //? append to the section where it as dropped
        if (response.data.success) {
          document.querySelector(`.${classname} > .list`).appendChild(draggableElement)
          setDraggable(null)
          //* on success send a message through websocket
          const received_data = {
            "type": message.UPDATE,
            "user_data": {
              "email": sessionStorage.getItem("email"),
              "username": sessionStorage.getItem("username"),
              "category": [startcontainer, classname]
            }
          }
          ws.send(JSON.stringify(received_data))
        }
      }).catch()
    } catch (error) {
      console.log(error.message)
    }

  }

  const fetchCards = () => {
    //* fetch data through api
    axios.post('/BM/fetchCards',
      {
        "ws_id": ws_id
      },
    ).then((response) => {
      const { tasks, underwork, completed, testing, deployed } = response.data.data
      // console.log("hi",response.data.data)
      setTasks(tasks)
      setUnderwork(underwork)
      setCompleted(completed)
      setTesting(testing)
      setDeployed(deployed)
    })
  }

  //! modal
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
        <h2>Add New Card</h2>
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
          <select name="category" id="category_input">
            <option value="tasks">Tasks</option>
            <option value="underwork">Underwork</option>
            <option value="completed">Completed</option>
            <option value="testing">Testing</option>
            <option value="deployed">Deployed</option>
          </select>
          <input type="text" className="title_input" placeholder='Title' />
          <input type="text" className="content_input" placeholder='Content' />
        </form>
      </div>

      {/* Modal Footer */}
      <div className="custom-modal-footer" style={{
        display: "flex",
        justifyContent: "space-between"
      }}>
        <button onClick={closeCustomModal}>Close Modal</button>
        <button onClick={(e) => {
          // console.log(e)
          const form = document.querySelector('.addnewform').children
          const category = form[0].value
          const title = form[1].value
          const content = form[2].value

          const data = {
            ws_id, category, title, content
          }

          axios.post('/BM/addCard',
            data,
          ).then((response) => {
            if (response.data.success) {
              alert("Added Succesfully")
              axios.post('/BM/fetchMultipleCards',
                {
                  ws_id: ws_id,
                  category: [category]
                }
              ).then((response) => {
                if (response.data.success) {
                  const cards = response.data.cards
                  category_models[category](cards[category])
                }
              })
              //! sending message to web Socket
              const received_data = {
                "type": message.UPDATE,
                "user_data": {
                  "email": sessionStorage.getItem("email"),
                  "username": sessionStorage.getItem("username"),
                  "category": [category]
                }
              }
              ws.send(JSON.stringify(received_data))
              closeCustomModal()
            } else {
              alert("Unable to add, please try again")
            }
          })
        }}
        >Submit</button>
      </div>
    </div>
  );


  //!modal for modification
  const [ModifyModalVisible, setModifyModalVisible] = useState(false);

  // Function to open the Modify modal
  const openModifyModal = () => setModifyModalVisible(true);

  // Function to close the Modify modal
  const closeModifyModal = () => setModifyModalVisible(false);

  const ModifyContentModal = (
    <div className="custom-modal-content">
      {/* Modal Header */}
      <div className="custom-modal-header">
        <h2>Modify Content</h2>
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
          > {currentInput.category} </h3>
          <input type="text" className="title_input" name='title' placeholder='Title' value={currentInput.title} onChange={(e) => { setInput({ ...currentInput, [e.target.name]: e.target.value }) }} />
          <input type="text" className="content_input" name='content' placeholder='Content' value={currentInput.content} onChange={(e) => { setInput({ ...currentInput, [e.target.name]: e.target.value }) }} />
        </form>
      </div>

      {/* Modal Footer */}
      <div className="custom-modal-footer" style={{
        display: "flex",
        justifyContent: "space-between"
      }}>
        <button onClick={closeModifyModal}>Close Modal</button>
        <button onClick={(e) => {
          const data = {
            "ws_id": ws_id,
            "category": currentInput.category,
            "card_id": card_id,
            "title": currentInput.title,
            "content": currentInput.content
          }

          axios.post('/BM/modifyCard',
            data,
          ).then((response) => {
            if (response.data.success) {
              alert("Modified Succesfully")
              axios.post('/BM/fetchMultipleCards',
                {
                  ws_id: ws_id,
                  category: [currentInput.category]
                }
              ).then((response) => {
                if (response.data.success) {
                  const cards = response.data.cards
                  category_models[currentInput.category](cards[currentInput.category])
                }
              })
              closeModifyModal()
            } else {
              alert("Unable to add, please try again")
            }
          })
        }}
        >Submit</button>
      </div>
    </div>
  );



  const handleChangeModal = (e, category, title, content, card_id) => {
    setInput({
      category,
      title,
      content
    })
    console.log(card_id)
    setCardid(card_id)
    openModifyModal()
  }

  //! random color generator
  function randomInteger(max) {
    return Math.floor(Math.random() * (max + 1));
  }

  function randomRgbColor() {
    let r = randomInteger(255);
    let g = randomInteger(255);
    let b = randomInteger(255);
    return [r, g, b];
  }

  function randomHexColor() {
    let [r, g, b] = randomRgbColor();
    let hr = r.toString(16).padStart(2, '0');
    let hg = g.toString(16).padStart(2, '0');
    let hb = b.toString(16).padStart(2, '0');
    return "#" + hr + hg + hb;
  }

  //! delete card

  const deleteCard = (e, category, card_id) => {
    axios.post("/BM/deleteCard",
      {
        ws_id: ws_id,
        category: category,
        card_id: card_id
      }
    ).then((response) => {
      if (response.data.success) {
        alert(response.data.message)

        //* calling to fetch new data
        axios.post('/BM/fetchMultipleCards',
          {
            ws_id: ws_id,
            category: [category]
          }
        ).then((response) => {
          if (response.data.success) {
            const cards = response.data.cards
            category_models[category](cards[category])
          }
        })
        const received_data = {
          "type": message.UPDATE,
          "user_data": {
            "email": sessionStorage.getItem("email"),
            "username": sessionStorage.getItem("username"),
            "category": [category]
          }
        }
        ws.send(JSON.stringify(received_data))
      } else {
        alert(response.data.message)
      }
    }).catch((err) => {
      console.log(err)
    })
  }
  return (
    <div className="board_container">
      <h2> {ws_id} </h2> 
      {/* {sessionStorage.getItem("username")} */}
      <h1
        style={{
          width: "100%",
          padding: "0px 10px",
          display: "flex"
        }}
      > {(users[0].username && users.map((item, key) => {
        // console.log(users[0])
        return <div key={key}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: randomHexColor(),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative", // Add position relative for absolute positioning
            margin: "0px 5px"
          }}
          onMouseEnter={(e) => {
            document.querySelector(`#hover${item.username}`).style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            document.querySelector(`#hover${item.username}`).style.opacity = "0";
          }}
        >
          {item.username[0] || 'No participants'}
          <span
            id={"hover" + item.username}
            style={{
              fontSize: "15px",
              width: "fit-content",
              backgroundColor: "#f2f2f2",
              borderRadius: "10px",
              padding: "0px 5px",
              position: "absolute",
              opacity: "0", // Set initial opacity to 0
              transition: "opacity 0.3s ease-in-out", // Add transition property
              zIndex: "1000",
            }}
          >
            {item.username}
          </span>
        </div>
        //   <div key={key}
        //   style={{
        //     display: "flex",
        //     justifyContent:"space-between",
        //     transition: "all 0.5s ease-in-out",
        //   }}
        // >
        // <p key={key}> {item.email} <br /> </p>
        // console.log(item)
      })) || 'no users'} </h1>
      <ReactModal
        isOpen={ModifyModalVisible}
        onRequestClose={closeModifyModal}
        contentLabel='Custom Modal'
        className='custom-modal'
        overlayClassName='custom-modal-overlay'
        ariaHideApp={false}
      >
        {ModifyContentModal}
      </ReactModal>
      <div className='screen'>
        <div className="tasks" onDragOver={(e) => { endDrag(e) }} onDrop={(e) => { onDrop(e, 'tasks') }}>
          <div className="heading" style={{
            backgroundColor: "Red"
          }}>Tasks</div>
          <div className="list">

            {tasks && tasks.map((item, key) => {
              return <div className="board_box" key={key} id={'tasks' + key} draggable='true' onDragStart={(e) => { handleDrag(e, 'tasks', item.card_id) }} onDoubleClick={(e) => {
                handleChangeModal(e, "tasks", item.title, item.content, item.card_id)
              }}>
                <div name='title' className="title"> {item.title} </div>
                <div className="content" name='content'> {item.content} </div>
                <button className="action" onClick={(e) => { deleteCard(e, "tasks", item.card_id) }}>
                  DELETE
                </button>
              </div>
            })
            }
          </div>
        </div>
        <div className="underwork" onDragOver={(e) => { endDrag(e) }} onDrop={(e) => { onDrop(e, 'underwork') }}>
          <div className="heading" style={{
            backgroundColor: "Blue"
          }}>Underwork</div>
          <div className="list">
            {underwork && underwork.map((item, key) => {
              return <div className="board_box" key={key} id={'underwork' + key} draggable='true' onDragStart={(e) => { handleDrag(e, 'underwork', item.card_id) }} onDoubleClick={(e) => {
                handleChangeModal(e, "underwork", item.title, item.content, item.card_id)
              }}>
                <div name='title' className="title"> {item.title} </div>
                <div className="content" name='content'> {item.content} </div>
                <button className="action" onClick={(e) => { deleteCard(e, "underwork", item.card_id) }}>
                  DELETE
                </button>
              </div>
            })
            }
          </div>
        </div>
        <div className="completed" onDragOver={(e) => { endDrag(e) }} onDrop={(e) => { onDrop(e, 'completed') }}>
          <div className="heading" style={{
            backgroundColor: "Green"
          }}>Completed</div>
          <div className="list">
            {completed && completed.map((item, key) => {
              return <div className="board_box" key={key} id={'completed' + key} draggable='true' onDragStart={(e) => { handleDrag(e, 'completed', item.card_id) }} onDoubleClick={(e) => {
                handleChangeModal(e, "completed", item.title, item.content, item.card_id)
              }}>
                <div name='title' className="title"> {item.title} </div>
                <div className="content" name='content'> {item.content} </div>
                <button className="action" onClick={(e) => { deleteCard(e, "completed", item.card_id) }}>
                  DELETE
                </button>
              </div>
            })
            }
          </div>
        </div>
        <div className="testing" onDragOver={(e) => { endDrag(e) }} onDrop={(e) => { onDrop(e, 'testing') }}>
          <div className="heading" style={{
            backgroundColor: "Orange"
          }}>Testing</div>
          <div className="list">
            {testing && testing.map((item, key) => {
              return <div className="board_box" key={key} id={'testing' + key} draggable='true' onDragStart={(e) => { handleDrag(e, 'testing', item.card_id) }} onDoubleClick={(e) => {
                handleChangeModal(e, "testing", item.title, item.content, item.card_id)
              }}>
                <div name='title' className="title"> {item.title} </div>
                <div className="content" name='content'> {item.content} </div>
                <button className="action" onClick={(e) => { deleteCard(e, "testing", item.card_id) }}>
                  DELETE
                </button>
              </div>
            })
            }
          </div>
        </div>
        <div className="deployed" onDragOver={(e) => { endDrag(e) }} onDrop={(e) => { onDrop(e, 'deployed') }}>
          <div className="heading" style={{
            backgroundColor: "Purple"
          }}>Deployed</div>
          <div className="list">
            {deployed && deployed.map((item, key) => {
              return <div className="board_box" key={key} id={'deployed' + key} draggable='true' onDragStart={(e) => { handleDrag(e, 'deployed', item.card_id) }} onDoubleClick={(e) => {
                handleChangeModal(e, "deployed", item.title, item.content, item.card_id)
              }}>
                <div name='title' className="title"> {item.title} </div>
                <div className="content" name='content'> {item.content} </div>
                <button className="action" onClick={(e) => { deleteCard(e, "deployed", item.card_id) }}>
                  DELETE
                </button>
              </div>
            })
            }
          </div>
        </div>

      </div>
      <button type='button' className="request_b" onClick={openCustomModal} style={{
        width: "50px",
        height: "50px",
        fontSize: "10px",
        top: "90%"
      }}>
        <h1>Add New</h1>
      </button>
      <ReactModal
        isOpen={customModalVisible}
        onRequestClose={closeCustomModal}
        contentLabel='Custom Modal'
        className='custom-modal'
        overlayClassName='custom-modal-overlay'
        ariaHideApp={false}
      >
        {customModalContent}
      </ReactModal>
    </div>
  )
}