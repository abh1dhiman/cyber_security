# backend/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from scanner import WebCrawler, XSSScanner, SQLIScanner, CSRFScanner, Reporter
import threading
import uuid
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create reports directory if it doesn't exist
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

# Store active scans
active_scans = {}

# Add a test route to verify backend is running
@app.route('/')
def home():
    return jsonify({
        'message': 'Vulnerability Scanner Backend is running!',
        'status': 'online',
        'endpoints': {
            'GET /api/scans': 'List all scans',
            'POST /api/scans': 'Create new scan',
            'GET /api/scans/<scan_id>': 'Get scan details',
            'DELETE /api/scans/<scan_id>': 'Delete scan',
            'GET /reports/<filename>': 'Download report files'
        }
    })

@app.route('/api/scans', methods=['POST'])
def create_scan():
    """API endpoint to start a new scan"""
    data = request.get_json()
    
    if not data or 'target_url' not in data:
        return jsonify({'error': 'Target URL is required'}), 400
    
    target_url = data['target_url']
    
    # Validate URL
    if not target_url.startswith(('http://', 'https://')):
        target_url = 'http://' + target_url
    
    # Create scan
    scan_id = str(uuid.uuid4())[:8]
    
    # Initialize scan in active_scans
    active_scans[scan_id] = {
        'scan_id': scan_id,
        'target_url': target_url,
        'status': 'running',
        'progress': 0,
        'created_at': datetime.now().isoformat(),
        'results': None
    }
    
    # Start scan in background
    def run_scan():
        try:
            scan_result = perform_scan(target_url, scan_id)
            active_scans[scan_id]['status'] = 'completed'
            active_scans[scan_id]['results'] = scan_result
            active_scans[scan_id]['progress'] = 100
        except Exception as e:
            active_scans[scan_id]['status'] = 'failed'
            active_scans[scan_id]['error'] = str(e)
            print(f"Scan error: {str(e)}")
    
    thread = threading.Thread(target=run_scan)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'scan_id': scan_id,
        'status': 'running',
        'message': 'Scan started successfully'
    }), 202

@app.route('/api/scans/<scan_id>', methods=['GET'])
def get_scan_status(scan_id):
    """API endpoint to get scan status and results"""
    scan = active_scans.get(scan_id)
    
    if not scan:
        return jsonify({'error': 'Scan not found'}), 404
    
    return jsonify(scan)

@app.route('/api/scans', methods=['GET'])
def get_all_scans():
    """API endpoint to list all scans"""
    scans_list = []
    for scan_id, scan in active_scans.items():
        vulnerability_count = 0
        if scan.get('results') and scan['results'].get('vulnerabilities'):
            vulnerability_count = len(scan['results']['vulnerabilities'])
        
        scans_list.append({
            'scan_id': scan['scan_id'],
            'target_url': scan['target_url'],
            'status': scan['status'],
            'created_at': scan['created_at'],
            'vulnerability_count': vulnerability_count
        })
    
    return jsonify(scans_list)

@app.route('/api/scans/<scan_id>', methods=['DELETE'])
def delete_scan(scan_id):
    """API endpoint to delete a scan"""
    if scan_id in active_scans:
        del active_scans[scan_id]
        return jsonify({'message': 'Scan deleted successfully'})
    
    return jsonify({'error': 'Scan not found'}), 404

# Serve report files
@app.route('/reports/<path:filename>')
def serve_report(filename):
    """Serve report files from the reports directory"""
    try:
        return send_from_directory(REPORTS_DIR, filename)
    except Exception as e:
        return jsonify({'error': f'Report file not found: {str(e)}'}), 404

def perform_scan(target_url, scan_id):
    """Perform the actual vulnerability scan"""
    try:
        # Update progress
        active_scans[scan_id]['progress'] = 10
        
        # Step 1: Crawl
        crawler = WebCrawler(target_url, max_pages=20)
        target_data = crawler.crawl()
        active_scans[scan_id]['progress'] = 30
        
        # Initialize reporter
        reporter = Reporter(scan_id)
        
        # Step 2: XSS Scan
        xss_scanner = XSSScanner()
        xss_vulns = xss_scanner.scan(target_data)
        reporter.add_vulnerabilities(xss_vulns)
        active_scans[scan_id]['progress'] = 50
        
        # Step 3: SQLi Scan
        sqli_scanner = SQLIScanner()
        sqli_vulns = sqli_scanner.scan(target_data)
        reporter.add_vulnerabilities(sqli_vulns)
        active_scans[scan_id]['progress'] = 70
        
        # Step 4: CSRF Scan
        csrf_scanner = CSRFScanner()
        csrf_vulns = csrf_scanner.scan(target_data)
        reporter.add_vulnerabilities(csrf_vulns)
        active_scans[scan_id]['progress'] = 90
        
        # Generate reports
        reporter.set_scan_info(target_url, datetime.now().isoformat())
        
        json_report = os.path.basename(reporter.generate_json_report())
        html_report = os.path.basename(reporter.generate_html_report())
        
        results = {
            'target_data': {
                'urls_crawled': len(target_data.get('urls', [])),
                'forms_found': len(target_data.get('forms', [])),
                'input_fields': len(target_data.get('input_fields', []))
            },
            'vulnerabilities': reporter.vulnerabilities,
            'summary': reporter._generate_summary(),
            'reports': {
                'json': json_report,
                'html': html_report
            }
        }
        
        return results
        
    except Exception as e:
        print(f"Scan error in perform_scan: {str(e)}")
        raise e

if __name__ == '__main__':
    print("=" * 50)
    print("Vulnerability Scanner Backend")
    print("=" * 50)
    print(f"Reports directory: {REPORTS_DIR}")
    print(f"Test the backend: http://localhost:5000/")
    print(f"API endpoint: http://localhost:5000/api/scans")
    print("=" * 50)
    app.run(debug=True, port=5000)