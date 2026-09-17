from fastapi import HTTPException, status

class SentinalException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class ScannerException(SentinalException):
    def __init__(self, scanner_name: str, message: str):
        super().__init__(detail=f"Scanner [{scanner_name}] encountered an error: {message}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NotFoundException(SentinalException):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(detail=f"{resource} with id '{resource_id}' not found", status_code=status.HTTP_404_NOT_FOUND)

class UnauthorizedException(SentinalException):
    def __init__(self, detail: str = "Invalid credentials or unauthorized"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)
