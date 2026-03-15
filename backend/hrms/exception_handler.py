from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import ValidationError, AuthenticationFailed, PermissionDenied, Throttled

from hrms.exceptions import AppException
from hrms.response import ApiResponse


def custom_exception_handler(exc, context):
    """Custom exception handler that formats all errors using ApiResponse."""
    response = drf_exception_handler(exc, context)

    if isinstance(exc, AppException):
        return ApiResponse.error(
            message=exc.detail,
            status_code=exc.status_code,
        )

    if isinstance(exc, ValidationError):
        errors = exc.detail
        if isinstance(errors, dict):
            first_key = next(iter(errors.keys()))
            first_error = errors[first_key]
            if isinstance(first_error, list):
                errors = first_error[0]
            else:
                errors = first_error
        elif isinstance(errors, list):
            errors = errors[0] if errors else "Validation failed"
        
        return ApiResponse.validation_error(
            errors=errors,
            message=str(errors),
        )

    if isinstance(exc, AuthenticationFailed):
        return ApiResponse.unauthorized(message=str(exc.detail))

    if isinstance(exc, PermissionDenied):
        return ApiResponse.forbidden(message=str(exc.detail))

    if isinstance(exc, Throttled):
        return ApiResponse.throttled(message=str(exc.detail))

    if response is not None:
        detail = response.data.get("detail", str(response.data))
        status_code = response.status_code
        
        if status_code == 404:
            return ApiResponse.not_found(message=str(detail))
        elif status_code == 401:
            return ApiResponse.unauthorized(message=str(detail))
        elif status_code == 403:
            return ApiResponse.forbidden(message=str(detail))
        elif status_code == 429:
            return ApiResponse.throttled(message=str(detail))
        elif status_code >= 500:
            return ApiResponse.server_error(message=str(detail))
        else:
            return ApiResponse.error(message=str(detail), status_code=status_code)

    return response  
