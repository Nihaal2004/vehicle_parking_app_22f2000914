from celery import shared_task
from flask import current_app as app, render_template_string
from application.database import db
from application.models import User, Reservation, ParkingLot, ParkingSpot
from datetime import datetime, timezone, timedelta
from sqlalchemy import func, extract
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import csv
import io
import os
import tempfile
from flask import current_app as app

def send_email(to_email, subject, html_content, attachment_path=None):
    """Helper function to send emails with better error handling"""
    try:
        print(f"Attempting to send email to: {to_email}")
        print(f"Subject: {subject}")
        print(f"SMTP Config: {app.config.get('SMTP_SERVER')}:{app.config.get('SMTP_PORT')}")
        print(f"Email User: {app.config.get('EMAIL_USER')}")
        print(f"Attachment: {attachment_path}")
        
        msg = MIMEMultipart('alternative')
        msg['From'] = app.config['EMAIL_USER']
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        if attachment_path and os.path.exists(attachment_path):
            print(f"Attaching file: {attachment_path}")
            with open(attachment_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {os.path.basename(attachment_path)}'
                )
                msg.attach(part)
        else:
            print(f"No attachment found at: {attachment_path}")
        
        print("Connecting to SMTP server...")
        server = smtplib.SMTP(app.config['SMTP_SERVER'], app.config['SMTP_PORT'])
        server.starttls()
        print("Logging in...")
        server.login(app.config['EMAIL_USER'], app.config['EMAIL_APP_PASSWORD'])
        print("Sending message...")
        server.send_message(msg)
        server.quit()
        print("Email sent successfully!")
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        print(f"Exception type: {type(e).__name__}")
        return False

@shared_task(ignore_results=False, name="daily_reminders")
def daily_reminders():
    """Send daily reminders to users with active reservations"""
    try:
        active_reservations = db.session.query(Reservation).filter_by(status='active').all()
        
        reminder_count = 0
        for reservation in active_reservations:
            user = reservation.user
            spot = reservation.spot
            lot = spot.lot
            
            # Fix: Ensure both datetimes are timezone-aware
            current_time = datetime.now(timezone.utc)
            
            # Make sure parking_timestamp is timezone-aware
            if reservation.parking_timestamp.tzinfo is None:
                parking_time = reservation.parking_timestamp.replace(tzinfo=timezone.utc)
            else:
                parking_time = reservation.parking_timestamp
            
            parking_duration = current_time - parking_time
            hours_parked = parking_duration.total_seconds() / 3600
            
            html_content = f"""
            <html>
            <body>
                <h2>Parking Reminder - Smart Parking System</h2>
                <p>Hello {user.username},</p>
                <p>This is a friendly reminder about your active parking reservation:</p>
                <ul>
                    <li><strong>Parking Lot:</strong> {lot.name}</li>
                    <li><strong>Spot Number:</strong> {spot.spot_number}</li>
                    <li><strong>License Plate:</strong> {reservation.license_plate}</li>
                    <li><strong>Parked Since:</strong> {parking_time.strftime('%Y-%m-%d %H:%M:%S UTC')}</li>
                    <li><strong>Duration:</strong> {hours_parked:.2f} hours</li>
                    <li><strong>Current Cost:</strong> ₹{(hours_parked * lot.price):.2f}</li>
                </ul>
                <p>Don't forget to release your spot when you're done!</p>
                <p>Best regards,<br>Smart Parking Team</p>
            </body>
            </html>
            """
            
            if send_email(user.email, "Daily Parking Reminder", html_content):
                reminder_count += 1
        
        return f"Sent {reminder_count} daily reminders successfully"
    
    except Exception as e:
        print(f"Error in daily_reminders: {str(e)}")
        return f"Error sending daily reminders: {str(e)}"

@shared_task(ignore_results=False, name="monthly_reports")
def monthly_reports():
    """Generate and send monthly activity reports to all users"""
    try:
        users = User.query.all()
        report_count = 0
        
        current_date = datetime.now(timezone.utc)
        first_day = current_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        for user in users:
            monthly_reservations = Reservation.query.filter(
                Reservation.user_id == user.id,
                Reservation.parking_timestamp >= first_day
            ).all()
            
            if not monthly_reservations:
                continue  
            
            total_reservations = len(monthly_reservations)
            completed_reservations = [r for r in monthly_reservations if r.status == 'completed']
            total_spent = sum(r.parking_cost or 0 for r in completed_reservations)
            
            # Fix: Handle timezone-aware datetime calculations
            total_hours = 0
            for r in completed_reservations:
                if r.leaving_timestamp:
                    # Ensure both timestamps are timezone-aware
                    leaving_time = r.leaving_timestamp
                    parking_time = r.parking_timestamp
                    
                    if leaving_time.tzinfo is None:
                        leaving_time = leaving_time.replace(tzinfo=timezone.utc)
                    if parking_time.tzinfo is None:
                        parking_time = parking_time.replace(tzinfo=timezone.utc)
                    
                    duration_hours = (leaving_time - parking_time).total_seconds() / 3600
                    total_hours += duration_hours
            
            html_content = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 40px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .stats {{ background-color: #f9f9f9; padding: 15px; margin: 10px 0; }}
                    .stat-item {{ margin: 5px 0; }}
                    table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                    th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                    th {{ background-color: #f2f2f2; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Monthly Parking Report</h1>
                    <p>{current_date.strftime('%B %Y')}</p>
                </div>
                <div class="content">
                    <h2>Hello {user.username},</h2>
                    <p>Here's your monthly parking activity summary:</p>
                    
                    <div class="stats">
                        <h3>Monthly Statistics</h3>
                        <div class="stat-item"><strong>Total Reservations:</strong> {total_reservations}</div>
                        <div class="stat-item"><strong>Completed Reservations:</strong> {len(completed_reservations)}</div>
                        <div class="stat-item"><strong>Total Amount Spent:</strong> ₹{total_spent:.2f}</div>
                        <div class="stat-item"><strong>Total Parking Hours:</strong> {total_hours:.2f}</div>
                    </div>
                    
                    <h3>Recent Reservations</h3>
                    <table>
                        <tr>
                            <th>Date</th>
                            <th>Parking Lot</th>
                            <th>Spot</th>
                            <th>License Plate</th>
                            <th>Duration (hrs)</th>
                            <th>Cost</th>
                            <th>Status</th>
                        </tr>
            """
            
            for reservation in monthly_reservations[-10:]:  
                duration = ""
                if reservation.leaving_timestamp:
                    # Fix: Handle timezone-aware datetime calculation
                    leaving_time = reservation.leaving_timestamp
                    parking_time = reservation.parking_timestamp
                    
                    if leaving_time.tzinfo is None:
                        leaving_time = leaving_time.replace(tzinfo=timezone.utc)
                    if parking_time.tzinfo is None:
                        parking_time = parking_time.replace(tzinfo=timezone.utc)
                    
                    duration = f"{((leaving_time - parking_time).total_seconds() / 3600):.2f}"
                
                html_content += f"""
                        <tr>
                            <td>{reservation.parking_timestamp.strftime('%Y-%m-%d')}</td>
                            <td>{reservation.spot.lot.name}</td>
                            <td>{reservation.spot.spot_number}</td>
                            <td>{reservation.license_plate}</td>
                            <td>{duration}</td>
                            <td>₹{reservation.parking_cost or 0:.2f}</td>
                            <td>{reservation.status.title()}</td>
                        </tr>
                """
            
            html_content += """
                    </table>
                    <p style="margin-top: 30px;">Thank you for using Smart Parking System!</p>
                    <p>Best regards,<br>Smart Parking Team</p>
                </div>
            </body>
            </html>
            """
            
            subject = f"Monthly Parking Report - {current_date.strftime('%B %Y')}"
            if send_email(user.email, subject, html_content):
                report_count += 1
        
        return f"Sent {report_count} monthly reports successfully"
    
    except Exception as e:
        print(f"Error in monthly_reports: {str(e)}")
        return f"Error generating monthly reports: {str(e)}"

@shared_task(ignore_results=False, name="export_csv")
def export_csv(user_id=None, report_type="reservations", requesting_user_id=None):
    """Generate CSV export for reservations data"""
    try:
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False, newline='')
        
        if report_type == "reservations":
            if user_id:
                reservations = Reservation.query.filter_by(user_id=user_id).order_by(Reservation.parking_timestamp.desc()).all()
                filename = f"user_{user_id}_reservations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                export_scope = f"User {user_id} reservations"
            else:
                reservations = Reservation.query.order_by(Reservation.parking_timestamp.desc()).all()
                filename = f"all_reservations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                export_scope = "All reservations"
            
            writer = csv.writer(temp_file)
            writer.writerow([
                'Reservation ID', 'Username', 'Email', 'Parking Lot', 'Spot Number',
                'License Plate', 'Parking Time', 'Leaving Time', 'Duration (Hours)',
                'Cost', 'Status'
            ])
            
            for res in reservations:
                duration = ""
                if res.leaving_timestamp:
                    # Fix: Handle timezone-aware datetime calculation
                    leaving_time = res.leaving_timestamp
                    parking_time = res.parking_timestamp
                    
                    if leaving_time.tzinfo is None:
                        leaving_time = leaving_time.replace(tzinfo=timezone.utc)
                    if parking_time.tzinfo is None:
                        parking_time = parking_time.replace(tzinfo=timezone.utc)
                    
                    duration = f"{((leaving_time - parking_time).total_seconds() / 3600):.2f}"
                
                writer.writerow([
                    res.id,
                    res.user.username,
                    res.user.email,
                    res.spot.lot.name,
                    res.spot.spot_number,
                    res.license_plate,
                    res.parking_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    res.leaving_timestamp.strftime('%Y-%m-%d %H:%M:%S') if res.leaving_timestamp else '',
                    duration,
                    res.parking_cost or 0,
                    res.status
                ])
            
            record_count = len(reservations)
        
        elif report_type == "parking_lots":
            lots = ParkingLot.query.all()
            filename = f"parking_lots_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            export_scope = "All parking lots"
            
            writer = csv.writer(temp_file)
            writer.writerow([
                'Lot ID', 'Name', 'Address', 'Pincode', 'Price per Hour',
                'Total Spots', 'Available Spots', 'Occupied Spots'
            ])
            
            for lot in lots:
                available_spots = ParkingSpot.query.filter_by(lot_id=lot.id, status='A').count()
                occupied_spots = lot.total_spots - available_spots
                
                writer.writerow([
                    lot.id,
                    lot.name,
                    lot.address,
                    lot.pincode,
                    lot.price,
                    lot.total_spots,
                    available_spots,
                    occupied_spots
                ])
            
            record_count = len(lots)
        
        temp_file.close()
        
        if requesting_user_id:
            requesting_user = User.query.get(requesting_user_id)
            if requesting_user:
                subject = f"CSV Export Ready - {report_type.title()}"
                html_content = f"""
                <html>
                <body>
                    <h2>CSV Export Ready</h2>
                    <p>Hello {requesting_user.username},</p>
                    <p>Your requested CSV export is ready and attached to this email.</p>
                    <ul>
                        <li><strong>Export Type:</strong> {report_type.title()}</li>
                        <li><strong>Export Scope:</strong> {export_scope}</li>
                        <li><strong>Records Exported:</strong> {record_count}</li>
                        <li><strong>Generated On:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</li>
                    </ul>
                    <p>The CSV file is attached to this email.</p>
                    <p>Best regards,<br>Smart Parking Team</p>
                </body>
                </html>
                """
                
                email_sent = send_email(requesting_user.email, subject, html_content, temp_file.name)
                
                return {
                    "message": f"CSV export completed for {report_type}",
                    "filename": filename,
                    "file_path": temp_file.name,
                    "record_count": record_count,
                    "export_scope": export_scope,
                    "email_sent": email_sent
                }
        
        return {
            "message": f"CSV export completed for {report_type}",
            "filename": filename,
            "file_path": temp_file.name,
            "record_count": record_count,
            "export_scope": export_scope,
            "email_sent": False,
            "error": "No requesting user ID provided"
        }
    
    except Exception as e:
        print(f"Error in export_csv: {str(e)}")
        return {"error": f"Error generating CSV export: {str(e)}"}

@shared_task(ignore_results=False, name="cleanup_temp_files")
def cleanup_temp_files():
    """Clean up temporary CSV files older than 24 hours"""
    try:
        temp_dir = tempfile.gettempdir()
        current_time = datetime.now()
        cleaned_count = 0
        
        for filename in os.listdir(temp_dir):
            if filename.endswith('.csv') and ('reservations_' in filename or 'parking_lots_' in filename):
                file_path = os.path.join(temp_dir, filename)
                file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                
                # Remove files older than 24 hours
                if (current_time - file_mtime).total_seconds() > 86400:
                    try:
                        os.remove(file_path)
                        cleaned_count += 1
                    except OSError:
                        pass
        
        return f"Cleaned up {cleaned_count} temporary files"
    
    except Exception as e:
        print(f"Error in cleanup_temp_files: {str(e)}")
        return f"Error cleaning up temp files: {str(e)}"