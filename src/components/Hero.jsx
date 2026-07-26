import './Hero.css'

export default function Hero(){
  return(
    <section className="hero">
      <div className="overlay">
        <h1>Watch the latest movies</h1>
        <p>Unlimited movies, TV shows and more.</p>

        <div className="hero-buttons">
          <button className="play-btn">▶ Play</button>
          <button className="info-btn">More Info</button>
        </div>
      </div>
    </section>
  )
}