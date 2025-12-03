// File defines the main React component for the Tiger Tix frontend application. Retrieves event data from the backend
// API and provides functionality to retrieve event data, purchase tickets, etc.
import React, { useEffect, useState } from 'react';
import './App.css';
import VoiceTest from "./Voice";

function LoginForm( {setLoggedIn, setUser }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async(e) => {
    e.preventDefault();
    setError('');
    try {
      // const res = await fetch('http://localhost:8001/api/authentication/login', {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({email, password})
      });

      const data = await res.json();

      if (res.ok) {
        setLoggedIn(true);
        setUser({email});
      }
      else {
        setError(data.message || "TigerTix login was unsuccessful");
      }
    } catch (err) {
      console.error(err);
      setError("TigerTix login was unsuccessful");
    }
  }

  return (
    <form onSubmit = {login}>
      <h2>Welcome Back! Log In to TigerTix:</h2>
        <label>Email:   
          <input name = "email" value = {email} onChange = {e => setEmail(e.target.value)} type = "text" style = {{"fontSize":"40px","marginLeft":"20px"}}></input>
        </label>
        <br />
        <label>Password:    
          <input name = "password" value = {password} onChange = {e => setPassword(e.target.value)} type = "password" style = {{"fontSize":"40px","marginLeft":"20px"}}></input>
        </label>
        <br />
        <br />
        <button style={{"padding":"10px", "fontWeight":"bolder"}} type = "submit">Login!</button>
        {error && <p style = {{"color":"red"}}>{error}</p>}

    </form>
  );

}

function RegistrationForm( { setLoggedIn }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const register = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // const res = await fetch('http://localhost:8001/api/authentication/register', {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('You have successfully registered for TigerTix! You may now log in.');
        setEmail('');
        setPassword('');
      }
      else {
        setError(data.message || "Registration for TigerTix was unsuccessful.");

      }
    } catch (err) {
      console.error(err);
      setError("Registration for TigerTix was unsuccessful.");
    }
  };

  return (
    <form onSubmit = {register} style={{"fontWeight":"normal"}}>
      <h2>Sign up for TigerTix Below:</h2>
        <label>Email:   
          <input name = "email" value = {email} onChange = {e => setEmail(e.target.value)} type = "text" style = {{"fontSize":"40px","marginLeft":"20px"}}></input>
        </label>
        <br />
        <label>Password:   
          <input name = "password" value = {password} onChange = {e => setPassword(e.target.value)} type = "password" style = {{"fontSize":"40px","marginLeft":"20px"}}></input>
        </label>
        <br />
        <br />
        <button type = "submit" style={{"padding":"10px", "fontWeight":"bolder"}}>Register!</button>
        {error && <p style = {{"color": "red"}}>{error}</p>}
        {success && <p style = {{"color":"green"}}>{success}</p>}


    </form>

  );
}




// Serves as root componenet of web app. Fetches the event data, displays events, handles user interactions.
// Returns: the webpage displaying all available events and buttons
// Side effects: indicates network request on component mount to get event data and update state when 
// necessary.
function App() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const[message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Gets event data from API when it first mounts. Ensures list is populated when page loads.
  // Sends request to backend and updates local state
  useEffect(() => {
    if (!loggedIn) return;
    // fetch('http://localhost:6001/api/events')
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/events`)
    .then((res) => res.json())
    .then((data) => setEvents(data))
    .catch((err) => console.error(err));
  }, [loggedIn])

  const logout = async () => {
    try {
      // await fetch ("http://localhost:8001/api/authentication/logout", {
      await fetch (`${process.env.REACT_APP_BACKEND_URL}/api/authentication/logout`, {
        method: "POST", 
        credentials: "include",
      });

      setLoggedIn(false);
      setUser(null);

    } catch (err) {
      console.error("Failed to logout of TigerTix.", err);
    }



  }

  //Speech helper function for accessiblity
  const speakText = (text, opts = {}) => {
    if (!window.speechSynthesis) return;
        try {
          window.speechSynthesis.cancel();
        }
        catch {}
        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.rate = opts.rate ?? 1;
        utterance.pitch = opts.pitch ?? 1;
        const pickVoice = (voices) => voices.find(v => v.lang && v.lang.startsWith('en')) || voices[0];
        const voices = window.speechSynthesis.getVoices()
        if (voices && voices.length > 0) {
          utterance.voice = pickVoice(voices);
          window.speechSynthesis.speak(utterance);
          return;
        }
        // window.speechSynthesis.spe
        // ak(utterance);

        const onVoicesChanged = () => {
          const v = window.speechSynthesis.getVoices();
          utterance.voice = pickVoice(v);
          window.speechSynthesis.speak(utterance);
          window.speechSynthesis.onvoiceschanged = null;
        }
        window.speechSynthesis.onvoicechanges = onVoicesChanged;
  }

  useEffect(() => {

    if (!loggedIn) return;

    if (events && events.length > 0) {
      const summary = `Found ${events.length} event${events.length > 1 ? 's' : ''}. ` +
        events.map(ev => `${ev.eventName}, on ${ev.eventDate}, with ${ev.numTickets} tickets remaining. `).join(' ');
      speakText(summary);
      } else if (message) {
        speakText(message);
      }
  }, [events, message, loggedIn]);
  

  async function handleRequest(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setEvents([]);

    try {
      // const response = await fetch('http://localhost:7001/api/llm/parse', {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/llm/parse`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({prompt: query})
      });
    
    const headers = (response.headers.get('content-type') || '').toLowerCase();

    if (headers.includes('application/json')) {
      const data = await response.json();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    
      else if (data?.events && Array.isArray(data.events)) {
        // setEvents(data.events);
        setEvents(data.events.map(ev => ({
          ...ev,
          aiTickets: data.tickets ?? 0,
          aiIntent: data.intent ?? null
        })))
      }
      else {

        setMessage("Your input was unable to be parsed. Please enter your desired event in a similar format to the provided example: I want to book two tickets to the upcoming jazz concert.");
      }
      } else {
        const text = await response.text();
        setMessage(text);
      }
    } catch (err) {
      setError("Request failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
    }
  


  //Handles process of purchasing tocker for a given event. Sends request to API to decrement available
  // ticket count, etc.
  // Params: eventName - name of event that a ticket is being purchased for
  // Params: id - unique ID of event being purchased
  // Returns: Promise<void> - operations to update database
  const buyTicket = async (eventName, id, qty = 1) => {

    // Send request
    try {
      // const res = await fetch(`http://localhost:6001/api/events/${id}/purchase`, {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/events/${id}/purchase`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {tickets: qty })

      });

      if (res.status === 401) {
        setLoggedIn(false);
        setUser(null);
        alert("Your TigerTix session has expired. Please login again.");
        window.location.reload();
        return;
      }

      const headersVar = (res.headers.get('content-type') || '').toLowerCase();
      let data;
      if (headersVar.includes('application/json')) {
        data = await res.json();
      } 
      else {
        const text = await res.text();
        console.error("Purchase endpoint returned non-json");
        alert("Purchase failed: " + text);
        return;
      }


      // Handles errors
      if (!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      //Update ticker count for purchase
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === id ? { ...event, numTickets: data.ticketsRemaining} : event
        )
      );

      //Notify user
      alert(`Ticket purchased for: ${eventName}. Remaining tickets: ${data.ticketsRemaining}`);



    } catch (error) {
      console.error(error);
      alert("Failed to purchase ticket.");
    }
  };



 

  //Displays page title, list of events with all the event information plus operations
  return (
    <div className="App">
      {loggedIn ? (
        
        <>

      <div style = {{"float":"right", "fontSize":"25px", "paddingRight":"70px", "whiteSpace":"pre"}}>
        {loggedIn ? (
          <>
          <br />
          <span>Logged in as: {user?.email}</span>
          <button onClick = {() => {logout(); window.location.reload();}} style = {{"marginLeft":"20px"}}>Log Out</button>
          </>
        ) : null}
      </div>
      <img src = "/tiger_paw.gif" alt = "Clemson Logo" style = {{"float":"left", "paddingLeft":"70px","height":"10rem", "width":"auto"}}></img>
       <h1 role="banner" style = {{"textAlign":"center", "whiteSpace":"pre"}}>                      Welcome to Tiger Tix!</h1>
      
         

      <main> 
        <form onSubmit = {handleRequest}>
          <input 
            type = "text"
            placeholder = "Type or use voice-to-text to let us know what kind of event and how many tickets you're looking for!"
            value = {query}
            onChange = {(e) => setQuery(e.target.value)}
            style = {{ width: '55%', fontSize: '35px', float: "left", marginLeft: "28rem"}}
            />         
          <button type = "submit" disabled = {loading} style = {{"fontSize":"35px", "marginRight":"36rem"}}>Ask!</button>
          <br />
          <br />
        </form>


        <VoiceTest onTranscribe = {(text) => {
          setQuery(text);
        }} />

        {loading && <p>Loading...</p>}
        {error && <p style = {{ color : 'black' }}>{error}</p>}

        {events.length > 0 ? (
          <section> 
            <h2 style = {{"textDecoration":"underline"}}>Available Events</h2>
          
            <button onClick={() => {
              const summary = `Reading ${events.length} events. ${events.map(ev => `${ev.eventName} on ${ev.eventDate}. This event has ${ev.numTickets} tickets remaining.`).join('. ')}`;
              console.log(summary);
              speakText(summary);
            }}>Read events</button>
            <button onClick={() => { try { window.speechSynthesis.cancel(); } catch {} }}>Stop</button>
          
          </section>
        ) : (
          message && (
            <section> 
                <h2>Ticket Booking Assistant</h2>
                <pre style = {{ whiteSpace: 'pre-wrap', fontSize: '1.7rem'}}>{message}</pre>
            </section>
          )
        )}
      </main>

      {/* This is the part that we had beforehand */}
        <ul>
        {events.map((event) => (
          <li role="list" key={event.id}>
            {event.eventName} - {event.eventDate}{' '}
              <button onClick={() => buyTicket(event.eventName, event.id, event.aiTickets ?? 1)}>Confirm Event Booking</button> - Tickets Left: {event.numTickets} 
          </li> 
        ))}
        </ul>
   


         </>
      ) : (
        <div style = {{"fontSize":"40px"}}>
          <br />
          <LoginForm setLoggedIn = {setLoggedIn} setUser = {setUser}/>
          <br />
          <br />
          <br />
          <br />
          <hr></hr>
          <h3>Not registered?
            <RegistrationForm setLoggedIn = {setLoggedIn} />
          </h3>
        </div>
      )};


    </div>
        
   
  

    )}


export default App;