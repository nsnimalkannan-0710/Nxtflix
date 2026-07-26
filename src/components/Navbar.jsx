import {Link} from 'react-router-dom'
import './Navbar.css'

export default function Navbar(){
  return(
    <nav className="navbar">
      <h1 className="logo">Nxtflix</h1>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/watch-later">Watch Later</Link>
      </div>

      <button className="logout-btn">Logout</button>
    </nav>
  )
}