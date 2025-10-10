import { useAuth } from '../context/AuthContext'
import AuthCard from './auth/AuthCard'

const HomePage = () => {
  const { currentUser } = useAuth()

  return (
    <main>
      <section className="hero" id="hero">
        <div className="hero-text">
          <h1>Manage glucose with confidence</h1>
          <p>
            GlucoMeter is your personalized companion for tracking blood glucose trends,
            identifying patterns, and staying ahead of potential concerns. Connect your meters, log
            meals, and receive actionable insights built for your everyday routine.
          </p>
          <ul className="hero-points">
            <li>Visualize glucose trends with adaptive charts</li>
            <li>Share secure reports with your care team instantly</li>
            <li>Receive reminders tailored to your lifestyle</li>
          </ul>
          {!currentUser && (
            <a className="primary-cta" href="#get-started">
              Join GlucoMeter today
            </a>
          )}
        </div>
        <AuthCard />
      </section>

      <section className="feature-grid" id="features">
        <article>
          <h3>Unified monitoring</h3>
          <p>
            Consolidate readings from multiple devices and locations into a single timeline.
            GlucoMeter harmonizes your data so every measurement contributes to the bigger picture.
          </p>
        </article>
        <article>
          <h3>Intelligent alerts</h3>
          <p>
            Stay informed with proactive alerts when your readings trend outside the target range.
            Customize thresholds to match your physician&apos;s guidance.
          </p>
        </article>
        <article>
          <h3>Collaborative care</h3>
          <p>
            Invite family or healthcare providers to follow along with curated weekly digests, charts,
            and downloadable reports that keep everyone aligned.
          </p>
        </article>
      </section>

      <section className="insights" id="insights">
        <div className="insight-card">
          <h4>Daily trends</h4>
          <p>
            Understand how meals, activity, and medication influence your glucose levels throughout
            the day. Identify opportunities to adjust routines in minutes.
          </p>
        </div>
        <div className="insight-card">
          <h4>Progress tracking</h4>
          <p>
            View week-over-week progress and celebrate milestones with a dashboard built to motivate
            sustainable change.
          </p>
        </div>
        <div className="insight-card">
          <h4>Data portability</h4>
          <p>
            Export your metrics securely for clinical visits or personal records with just a click.
            Your data is always yours to control.
          </p>
        </div>
      </section>

      <section className="security" id="security">
        <h2>Security you can trust</h2>
        <div className="security-content">
          <p>
            Your health data deserves the highest standards of protection. GlucoMeter uses encrypted
            storage, role-based access, and rigorous compliance practices so you remain in full
            control of your records.
          </p>
          <ul>
            <li>End-to-end encryption for sensitive information</li>
            <li>Granular permissions for patient, caregiver, and clinician access</li>
            <li>Audit trails that monitor every critical action</li>
          </ul>
        </div>
      </section>
    </main>
  )
}

export default HomePage
