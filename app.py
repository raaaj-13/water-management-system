import psycopg2
from flask import Flask, render_template, request, redirect, url_for, flash, session

app = Flask(__name__)
app.secret_key = 'water_management_secret_key'

# In-memory storage for registered users (for demo purposes)
registered_users = {}

# Simple authentication decorators
def login_required(f):
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

def admin_required(f):
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        if session.get('role') != 'admin':
            flash('Admin access required', 'error')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

# Database connection
def get_db():
    try:
        return psycopg2.connect(
            host='localhost',
            database='water_management',
            user='postgres',
            password='admin123',
            port='5432'
        )
    except Exception as e:
        print(f"DB Error: {e}")
        return None

# Initialize database with tables and sample data
def init_db():
    conn = get_db()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        
        # Create tables
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(50) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
                full_name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE
            )
        """)
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS water_usage (
                id SERIAL PRIMARY KEY,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usage_liters DECIMAL(10,2) NOT NULL,
                source VARCHAR(20) NOT NULL,
                purpose VARCHAR(20) NOT NULL,
                location VARCHAR(100) NOT NULL,
                cost DECIMAL(8,2) DEFAULT 0.00,
                notes TEXT
            )
        """)
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS water_quality (
                id SERIAL PRIMARY KEY,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                location VARCHAR(100) NOT NULL,
                ph_level DECIMAL(4,2) NOT NULL,
                turbidity DECIMAL(8,2) NOT NULL,
                chlorine DECIMAL(6,2) NOT NULL,
                temperature DECIMAL(5,2) NOT NULL,
                dissolved_oxygen DECIMAL(6,2) NOT NULL,
                conductivity DECIMAL(8,2) NOT NULL,
                quality_status VARCHAR(20) NOT NULL
            )
        """)
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                alert_type VARCHAR(20) NOT NULL,
                severity VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                location VARCHAR(100),
                resolved BOOLEAN DEFAULT FALSE
            )
        """)
        
        # Insert sample data if tables are empty
        cur.execute("SELECT COUNT(*) FROM users")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO users (username, email, password, role, full_name) VALUES
                ('admin', 'admin@watermgmt.com', 'admin123', 'admin', 'System Administrator'),
                ('user', 'user@watermgmt.com', 'user123', 'user', 'Water Manager')
            """)
            
            cur.execute("""
                INSERT INTO water_usage (usage_liters, source, purpose, location, cost) VALUES
                (150.50, 'municipal', 'domestic', 'Main Building', 0.75),
                (500.00, 'well', 'agricultural', 'Field A', 0.00),
                (1000.00, 'municipal', 'industrial', 'Plant', 5.00)
            """)
            
            cur.execute("""
                INSERT INTO water_quality (location, ph_level, turbidity, chlorine, temperature, dissolved_oxygen, conductivity, quality_status) VALUES
                ('Main Building', 7.2, 2.5, 0.5, 22.0, 8.5, 450.0, 'excellent'),
                ('Field A', 7.8, 3.2, 0.3, 20.5, 7.8, 520.0, 'good'),
                ('Plant', 6.8, 5.8, 1.2, 23.5, 6.2, 680.0, 'fair')
            """)
        
        conn.commit()
        print("Database ready!")
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        conn.close()

# Authentication routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check hardcoded admin user
        if username == 'admin' and password == 'admin123':
            session['user_id'] = 1
            session['username'] = 'admin'
            session['role'] = 'admin'
            session['full_name'] = 'System Administrator'
            flash('Welcome Admin!', 'success')
            return redirect(url_for('dashboard'))
        
        # Check hardcoded demo user
        elif username == 'user' and password == 'user123':
            session['user_id'] = 2
            session['username'] = 'user'
            session['role'] = 'user'
            session['full_name'] = 'Water Manager'
            flash('Welcome User!', 'success')
            return redirect(url_for('dashboard'))
        
        # Check registered users in memory
        elif username in registered_users and registered_users[username]['password'] == password:
            user_data = registered_users[username]
            session['user_id'] = 1000 + len(registered_users)  # Unique ID
            session['username'] = user_data['username']
            session['role'] = user_data['role']
            session['full_name'] = user_data['full_name']
            flash(f'Welcome {user_data["full_name"]}!', 'success')
            return redirect(url_for('dashboard'))
        
        # Try database authentication if available
        else:
            conn = get_db()
            if conn:
                try:
                    cur = conn.cursor()
                    cur.execute("SELECT * FROM users WHERE username = %s AND password = %s", 
                              (username, password))
                    user = cur.fetchone()
                    
                    if user:
                        session['user_id'] = user[0]
                        session['username'] = user[1]
                        session['role'] = user[4]
                        session['full_name'] = user[5]
                        flash(f'Welcome {user[5]}!', 'success')
                        return redirect(url_for('dashboard'))
                except Exception as e:
                    print(f"DB Login error: {e}")
                finally:
                    conn.close()
            
            flash('Invalid credentials', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        full_name = request.form['full_name']
        
        # Try to save to PostgreSQL database first
        conn = get_db()
        if conn:
            try:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO users (username, email, password, role, full_name)
                    VALUES (%s, %s, %s, %s, %s)
                """, (username, email, password, 'user', full_name))
                conn.commit()
                flash('Registration successful! Please login.', 'success')
                return redirect(url_for('login'))
            except Exception as e:
                print(f"DB Registration error: {e}")
                # Fall back to memory storage
            finally:
                conn.close()
        
        # Fallback to memory storage
        if username in registered_users:
            flash('Username already exists!', 'error')
            return render_template('register.html')
        
        registered_users[username] = {
            'username': username,
            'email': email,
            'password': password,
            'full_name': full_name,
            'role': 'user'
        }
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out', 'info')
    return redirect(url_for('login'))

# Dashboard routes
@app.route('/dashboard')
@login_required
def dashboard():
    if session.get('role') == 'admin':
        return redirect(url_for('admin_dashboard'))
    else:
        return redirect(url_for('user_dashboard'))

@app.route('/admin-dashboard')
@login_required
@admin_required
def admin_dashboard():
    conn = get_db()
    if not conn:
        return render_template('admin_dashboard.html', stats={})
    
    try:
        cur = conn.cursor()
        
        # Get statistics
        cur.execute("SELECT COALESCE(SUM(usage_liters), 0) FROM water_usage WHERE DATE(date) = CURRENT_DATE")
        today_usage = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(DISTINCT location) FROM water_usage")
        locations = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM alerts WHERE resolved = FALSE")
        alerts = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM users")
        users = cur.fetchone()[0]
        
        stats = {
            'today_usage': float(today_usage),
            'total_locations': locations,
            'active_alerts': alerts,
            'total_users': users
        }
        
        return render_template('admin_dashboard.html', stats=stats)
    except Exception as e:
        print(f"Error: {e}")
        return render_template('admin_dashboard.html', stats={})
    finally:
        conn.close()

@app.route('/user-dashboard')
@login_required
def user_dashboard():
    conn = get_db()
    if not conn:
        return render_template('user_dashboard.html', stats={})
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT COALESCE(SUM(usage_liters), 0) FROM water_usage WHERE DATE(date) = CURRENT_DATE")
        today_usage = cur.fetchone()[0]
        
        stats = {
            'today_usage': float(today_usage),
            'user_name': session.get('full_name', 'User')
        }
        
        return render_template('user_dashboard.html', stats=stats)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

# Main routes
@app.route('/')
@login_required
def index():
    return redirect(url_for('dashboard'))

@app.route('/water-usage')
@login_required
def water_usage():
    conn = get_db()
    if not conn:
        return render_template('water_usage.html', usage_data=[])
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM water_usage ORDER BY date DESC LIMIT 50")
        usage_data = cur.fetchall()
        return render_template('water_usage.html', usage_data=usage_data)
    except Exception as e:
        print(f"Error: {e}")
        return render_template('water_usage.html', usage_data=[])
    finally:
        conn.close()

@app.route('/add-usage', methods=['GET', 'POST'])
@login_required
def add_usage():
    if request.method == 'POST':
        conn = get_db()
        if conn:
            try:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO water_usage (usage_liters, source, purpose, location, cost, notes)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    float(request.form['usage_liters']),
                    request.form['source'],
                    request.form['purpose'],
                    request.form['location'],
                    float(request.form.get('cost', 0)),
                    request.form.get('notes', '')
                ))
                
                conn.commit()
                flash('Usage recorded', 'success')
                return redirect(url_for('water_usage'))
            except Exception as e:
                print(f"Error: {e}")
                flash('Error recording usage', 'error')
            finally:
                conn.close()
    
    return render_template('add_usage.html')

# Water quality routes
@app.route('/water-quality')
@login_required
def water_quality():
    conn = get_db()
    if not conn:
        return render_template('water_quality.html', quality_data=[])
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM water_quality ORDER BY date DESC LIMIT 50")
        quality_data = cur.fetchall()
        return render_template('water_quality.html', quality_data=quality_data)
    except Exception as e:
        print(f"Error: {e}")
        return render_template('water_quality.html', quality_data=[])
    finally:
        conn.close()

@app.route('/add-quality', methods=['GET', 'POST'])
@login_required
def add_quality():
    if request.method == 'POST':
        conn = get_db()
        if conn:
            try:
                cur = conn.cursor()
                # Simple quality determination
                ph = float(request.form['ph_level'])
                if 6.5 <= ph <= 8.5:
                    status = 'excellent'
                elif 6.0 <= ph <= 9.0:
                    status = 'good'
                else:
                    status = 'fair'
                
                cur.execute("""
                    INSERT INTO water_quality (location, ph_level, turbidity, chlorine, temperature, dissolved_oxygen, conductivity, quality_status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    request.form['location'],
                    ph,
                    float(request.form['turbidity']),
                    float(request.form['chlorine']),
                    float(request.form['temperature']),
                    float(request.form['dissolved_oxygen']),
                    float(request.form['conductivity']),
                    status
                ))
                
                conn.commit()
                flash('Quality recorded', 'success')
                return redirect(url_for('water_quality'))
            except Exception as e:
                print(f"Error: {e}")
                flash('Error recording quality', 'error')
            finally:
                conn.close()
    
    return render_template('add_quality.html')

# Alerts and analytics routes
@app.route('/alerts')
@login_required
def alerts():
    conn = get_db()
    if not conn:
        return render_template('alerts.html', alerts_data=[])
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM alerts ORDER BY alert_date DESC LIMIT 100")
        alerts_data = cur.fetchall()
        return render_template('alerts.html', alerts_data=alerts_data)
    except Exception as e:
        print(f"Error: {e}")
        return render_template('alerts.html', alerts_data=[])
    finally:
        conn.close()

@app.route('/resolve-alert/<int:alert_id>')
@login_required
def resolve_alert(alert_id):
    conn = get_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("UPDATE alerts SET resolved = TRUE WHERE id = %s", (alert_id,))
            conn.commit()
            flash('Alert resolved', 'success')
        except Exception as e:
            print(f"Error: {e}")
        finally:
            conn.close()
    
    return redirect(url_for('alerts'))

@app.route('/analytics')
@login_required
@admin_required
def analytics():
    conn = get_db()
    if not conn:
        return render_template('analytics.html', analytics_data={})
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT source, SUM(usage_liters) FROM water_usage GROUP BY source")
        usage_by_source = dict(cur.fetchall())
        
        analytics_data = {'usage_by_source': usage_by_source}
        return render_template('analytics.html', analytics_data=analytics_data)
    except Exception as e:
        print(f"Error: {e}")
        return render_template('analytics.html', analytics_data={})
    finally:
        conn.close()

# Run the application
if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5001)
