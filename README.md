# Water Management System

A comprehensive water management system built with Flask, PostgreSQL, HTML, and CSS for monitoring water usage, quality, and analytics.

## Features

- **Water Usage Tracking**: Record and monitor water consumption from different sources
- **Water Quality Monitoring**: Track water quality parameters and generate alerts
- **Alert System**: Automatic alerts for high usage and poor water quality
- **Analytics Dashboard**: Visual analytics for usage trends and quality metrics
- **Location Management**: Track multiple locations and water sources
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, Bootstrap 5, Jinja2 templates
- **Minimal Dependencies**: Only 3 Python packages required

## Project Screenshots

Here are some screenshots showcasing the water management system:

### Dashboard Overview
![Dashboard](photo/Screenshot%202026-04-19%20at%2012.06.45%E2%80%AFAM.png)

### User Interface
![User Interface](photo/Screenshot%202026-04-19%20at%2012.29.55%E2%80%AFAM.png)

### Water Quality Monitoring
![Water Quality](photo/Screenshot%202026-04-19%20at%2012.30.10%E2%80%AFAM.png)

### Usage Analytics
![Analytics](photo/Screenshot%202026-04-19%20at%2012.30.25%E2%80%AFAM.png)

### Registration Page
![Registration](photo/Screenshot%202026-04-19%20at%2012.31.00%20AM.png)

### Admin Dashboard
![Admin Panel](photo/Screenshot%202026-04-19%20at%2012.31.52%E2%80%AFAM.png)

### Mobile View
![Mobile Interface](photo/Screenshot%202026-04-19%20at%2012.32.08%E2%80%AFAM.png)

### Reports Section
![Reports](photo/Screenshot%202026-04-19%20at%2012.32.13%E2%80%AFAM.png)

### Settings
![Settings](photo/Screenshot%202026-04-19%20at%2012.32.24%E2%80%AFAM.png)

## Installation

### Prerequisites

- Python 3.7+
- PostgreSQL 12+
- pip package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd water-management-system
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL database**
   ```sql
   -- Connect to PostgreSQL as superuser
   CREATE DATABASE water_management;
   CREATE USER water_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE water_management TO water_user;
   ```

5. **Configure environment variables**
   Create a `.env` file in the project root:
   ```env
   DB_HOST=localhost
   DB_NAME=water_management
   DB_USER=water_user
   DB_PASSWORD=your_password
   DB_PORT=5432
   ```

6. **Initialize the database**
   ```bash
   python app.py
   ```
   The database will be automatically initialized with the schema on first run.

7. **Run the application**
   ```bash
   python app.py
   ```

8. **Access the application**
   Open your browser and navigate to: `http://localhost:5000`

## Database Schema

The system uses the following main tables:

- **water_usage**: Records water consumption data
- **water_quality**: Stores water quality test results
- **alerts**: System alerts and notifications
- **locations**: Managed locations
- **water_sources**: Available water sources

### Key Tables Structure

#### water_usage
- `id`: Primary key
- `date`: Timestamp of usage
- `usage_liters`: Amount of water used
- `source`: Water source type
- `purpose`: Usage purpose
- `location`: Location identifier
- `cost`: Cost in USD
- `notes`: Additional notes

#### water_quality
- `id`: Primary key
- `date`: Test timestamp
- `location`: Test location
- `ph_level`: pH value (0-14)
- `turbidity`: Turbidity in NTU
- `chlorine`: Chlorine level in mg/L
- `temperature`: Temperature in Celsius
- `dissolved_oxygen`: DO level in mg/L
- `conductivity`: Conductivity in µS/cm
- `quality_status`: Overall quality rating

## Usage Guide

### Recording Water Usage

1. Navigate to "Water Usage" from the main menu
2. Click "Add New Usage"
3. Fill in the required fields:
   - Usage amount in liters
   - Water source (municipal, well, rainwater, recycled)
   - Purpose (domestic, agricultural, industrial, commercial)
   - Location
   - Optional cost and notes
4. Click "Record Usage"

### Recording Water Quality

1. Navigate to "Water Quality" from the main menu
2. Click "Add New Quality Test"
3. Enter water quality parameters:
   - Location
   - pH level (6.5-8.5 is excellent)
   - Turbidity (< 5 NTU is excellent)
   - Chlorine level (0.2-1.0 mg/L is excellent)
   - Temperature
   - Dissolved oxygen
   - Conductivity
4. The system automatically determines quality status
5. Click "Record Quality Test"

### Managing Alerts

1. Navigate to "Alerts" to view system notifications
2. Alerts are automatically generated for:
   - High water usage (> 1000 liters)
   - Poor water quality
3. Click "Resolve" to mark alerts as resolved

### Viewing Analytics

1. Navigate to "Analytics" for insights and trends
2. View 30-day usage trends
3. Analyze usage by source and purpose
4. Monitor water quality status distribution
5. Review summary statistics

## Quality Standards

The system uses the following water quality standards:

### Excellent Quality
- pH: 6.5 - 8.5
- Turbidity: < 5 NTU
- Chlorine: 0.2 - 1.0 mg/L

### Good Quality
- pH: 6.0 - 9.0
- Turbidity: < 10 NTU
- Chlorine: 0.1 - 2.0 mg/L

### Fair Quality
- pH: 5.5 - 9.5
- Turbidity: < 20 NTU
- Chlorine: < 3.0 mg/L

### Poor Quality
- Values outside acceptable ranges
- Requires immediate attention

## API Endpoints

The system provides RESTful API endpoints:

- `GET /` - Dashboard with statistics
- `GET /water-usage` - List water usage records
- `POST /add-usage` - Add new water usage
- `GET /water-quality` - List water quality records
- `POST /add-quality` - Add new quality test
- `GET /alerts` - List system alerts
- `PUT /resolve-alert/<id>` - Resolve an alert
- `GET /analytics` - Analytics data

## Project Structure

```
water-management-system/
    app.py                 # Main Flask application
    requirements.txt        # Python dependencies
    schema.sql             # Database schema
    README.md              # This file
    .env                   # Environment variables (create this)
    templates/             # HTML templates
        base.html          # Base template
        index.html         # Dashboard
        water_usage.html   # Water usage list
        add_usage.html     # Add water usage form
        water_quality.html # Water quality list
        add_quality.html   # Add quality test form
        alerts.html        # Alerts page
        analytics.html     # Analytics page
    static/
        css/
            style.css      # Main stylesheet
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the database connection
2. Verify environment variables
3. Ensure PostgreSQL is running
4. Review application logs

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists and user has permissions

### Application Errors
- Check Flask logs for detailed error messages
- Verify all required fields are filled in forms
- Ensure proper data formats (numeric values for measurements)

### Performance Issues
- Consider adding database indexes for large datasets
- Implement pagination for large record sets
- Regular database maintenance
