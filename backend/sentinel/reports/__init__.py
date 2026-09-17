try:
    from app.reports.generator import ReportGenerator, report_generator
except Exception:
    try:
        from sentinel.reports.generator import ReportGenerator, report_generator
    except Exception:
        from .generator import ReportGenerator, report_generator

__all__ = ["ReportGenerator", "report_generator"]
