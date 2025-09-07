<h1>Ghar Se Kaam - LiveKit Screen Share</h1>

<p>Ghar Se Kaam is a real-time, multi-user screen sharing application built with Next.js, LiveKit, and Prisma. It provides a secure, one-to-many presentation platform where an admin can create a room and view the screens of multiple users simultaneously. The application features a waiting room system, allowing the admin to admit or deny participants before they can join and share their screen.</p>

<h2>Key Features</h2>

<ul>
  <li><strong>Admin-Controlled Rooms</strong>: Admins can create password-protected rooms with unique names.</li>
  <li><strong>Waiting Room</strong>: Admins have full control over who enters the room, with the ability to admit or deny users from a waiting list.</li>
  <li><strong>Many-to-One Sharing</strong>: Supports multiple users sharing their screens and audio simultaneously.</li>
  <li><strong>Admin-Only Viewing</strong>: Only the room's admin can view the participants' shared screens, ensuring a secure presentation or support session.</li>
  <li><strong>Real-Time Communication</strong>: Built on top of LiveKit's high-performance WebRTC SFU for low-latency audio and video.</li>
  <li><strong>Containerized Deployment</strong>: Comes with a complete Docker and Nginx setup for easy and scalable production deployment.</li>
</ul>

<h2>Getting Started (Local Development)</h2>

<h3>Prerequisites</h3>

<ul>
  <li>Node.js (v20 or later)</li>
  <li>npm or yarn</li>
  <li>A running PostgreSQL database</li>
</ul>

<h3>Installation</h3>

<ol>
  <li>
    <strong>Clone the repository:</strong>
    <pre><code>git clone &lt;your-repository-url&gt;
cd livekit-multiscreen</code></pre>
  </li>
  <li>
    <strong>Install dependencies:</strong>
    <pre><code>npm install</code></pre>
  </li>
  <li>
    <strong>Set up your environment variables:</strong>
    <p>Copy the <code>.env.example</code> file to a new <code>.env</code> file and fill in your details for the database and LiveKit API.</p>
    <pre><code>cp .env.example .env</code></pre>
  </li>
  <li>
    <strong>Run database migrations:</strong>
    <p>This will set up your PostgreSQL database with the required tables.</p>
    <pre><code>npx prisma migrate dev</code></pre>
  </li>
  <li>
    <strong>Run the development server:</strong>
    <pre><code>npm run dev</code></pre>
    <p>Your application will be available at <code>http://localhost:3000</code>.</p>
  </li>
</ol>

<h2>Production Deployment with Docker & Nginx</h2>

<p>This application is configured for a production-ready deployment using Docker Compose and Nginx as a reverse proxy.</p>

<h3>Prerequisites</h3>

<ul>
  <li>Docker</li>
  <li>Docker Compose</li>
</ul>

<h3>Setup</h3>

<ol>
  <li>
    <strong>Create your production environment file:</strong>
    <p>Make sure you have a <code>.env</code> file in the project root containing your production <code>DATABASE_URL</code>, LiveKit keys, and <code>JWT_SECRET</code>. The database URL should point to your production database. If running the container on the same machine as the database, use <code>host.docker.internal</code> as the hostname.</p>
    <pre><code>DATABASE_URL=postgresql://USER:PASSWORD@host.docker.internal:5433/DATABASE
...</code></pre>
  </li>
  <li>
    <strong>Configure Nginx:</strong>
    <p>Open the <code>nginx.conf</code> file and replace <code>your_domain.com</code> with your actual domain name or <code>localhost</code> if running locally.</p>
  </li>
  <li>
    <strong>Build and Run the Containers:</strong>
    <p>Run the following command from the project's root directory:</p>
    <pre><code>docker-compose up --build -d</code></pre>
    <p>This command will:</p>
    <ul>
      <li>Build the Next.js application into a production-optimized Docker image.</li>
      <li>Start the application container.</li>
      <li>Start the Nginx container, which will proxy traffic to your application.</li>
    </ul>
    <p>Your application is now running and accessible on port 80 of your server or at <code>http://localhost</code>.</p>
  </li>
</ol>