# backend/scanner/reporter.py
import json
from datetime import datetime
import os

class Reporter:
    def __init__(self, scan_id):
        self.scan_id = scan_id
        self.vulnerabilities = []
        self.scan_info = {}
        # Use absolute path for reports directory
        self.reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'reports')
        os.makedirs(self.reports_dir, exist_ok=True)
    
    def add_vulnerabilities(self, vulns):
        """Add vulnerabilities to report"""
        self.vulnerabilities.extend(vulns)
    
    def set_scan_info(self, target_url, start_time):
        """Set scan information"""
        self.scan_info = {
            'target_url': target_url,
            'start_time': start_time,
            'end_time': datetime.now().isoformat(),
            'total_vulnerabilities': len(self.vulnerabilities)
        }
    
    def generate_json_report(self):
        """Generate JSON format report"""
        report = {
            'scan_info': self.scan_info,
            'vulnerabilities': self.vulnerabilities,
            'summary': self._generate_summary()
        }
        
        filename = f"scan_{self.scan_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(self.reports_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"JSON report saved: {filepath}")
        return filepath
    
    def generate_html_report(self):
        """Generate HTML format report"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Scan Report - {self.scan_id}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                .container {{ max-width: 1200px; margin: 0 auto; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }}
                .vulnerability {{ border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; background: white; }}
                .critical {{ border-left: 5px solid #dc3545; }}
                .high {{ border-left: 5px solid #fd7e14; }}
                .medium {{ border-left: 5px solid #ffc107; }}
                .low {{ border-left: 5px solid #28a745; }}
                .severity {{ font-weight: bold; }}
                .evidence {{ background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; margin-top: 10px; }}
                .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }}
                .stat-card {{ background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .stat-number {{ font-size: 2em; font-weight: bold; color: #667eea; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Vulnerability Scan Report</h1>
                    <p>Scan ID: {self.scan_id}</p>
                </div>
                
                <h2>Scan Information</h2>
                <div class="summary">
                    <div class="stat-card">
                        <div class="stat-number">{self.scan_info.get('target_url', 'N/A')}</div>
                        <div>Target URL</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{len(self.vulnerabilities)}</div>
                        <div>Total Vulnerabilities</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{self.scan_info.get('start_time', 'N/A')[:10]}</div>
                        <div>Scan Date</div>
                    </div>
                </div>
                
                <h2>Summary by Severity</h2>
                <div class="summary">
        """
        
        summary = self._generate_summary()
        for severity, count in summary['by_severity'].items():
            color = {
                'critical': '#dc3545',
                'high': '#fd7e14',
                'medium': '#ffc107',
                'low': '#28a745'
            }.get(severity.lower(), '#6c757d')
            
            html += f"""
                    <div class="stat-card">
                        <div class="stat-number" style="color: {color};">{count}</div>
                        <div>{severity}</div>
                    </div>
            """
        
        html += """
                </div>
                
                <h2>Vulnerabilities</h2>
        """
        
        if not self.vulnerabilities:
            html += """
                <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 5px; text-align: center;">
                    <h3>✅ No vulnerabilities found!</h3>
                    <p>Your application appears to be secure against the tested attack vectors.</p>
                </div>
            """
        else:
            for vuln in self.vulnerabilities:
                severity_class = vuln.get('severity', 'Unknown').lower()
                html += f"""
                <div class="vulnerability {severity_class}">
                    <h3>{vuln.get('type', 'Unknown Vulnerability')}</h3>
                    <p><strong>URL:</strong> {vuln.get('url', 'N/A')}</p>
                    <p><strong>Severity:</strong> <span class="severity">{vuln.get('severity', 'N/A')}</span></p>
                    <p><strong>Parameter:</strong> {vuln.get('parameter', 'N/A')}</p>
                    <p><strong>Method:</strong> {vuln.get('method', 'GET')}</p>
                    <p><strong>Payload:</strong> <code>{vuln.get('payload', 'N/A')}</code></p>
                    <div class="evidence">
                        <strong>Evidence:</strong><br>
                        {vuln.get('evidence', 'N/A')}
                    </div>
                </div>
                """
        
        html += """
            </div>
        </body>
        </html>
        """
        
        filename = f"scan_{self.scan_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        filepath = os.path.join(self.reports_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"HTML report saved: {filepath}")
        return filepath
    
    def _generate_summary(self):
        """Generate summary statistics"""
        summary = {
            'total': len(self.vulnerabilities),
            'by_type': {},
            'by_severity': {
                'Critical': 0,
                'High': 0,
                'Medium': 0,
                'Low': 0
            }
        }
        
        for vuln in self.vulnerabilities:
            # Count by type
            v_type = vuln.get('type', 'Unknown')
            summary['by_type'][v_type] = summary['by_type'].get(v_type, 0) + 1
            
            # Count by severity
            severity = vuln.get('severity', 'Unknown')
            if severity in summary['by_severity']:
                summary['by_severity'][severity] += 1
        
        return summary