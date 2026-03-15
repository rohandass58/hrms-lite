from rest_framework.response import Response
from rest_framework import status

from hrms.constants import (
    RESPONSE_TYPE_SUCCESS,
    RESPONSE_TYPE_ERROR,
    RESPONSE_TYPE_VALIDATION_ERROR,
    RESPONSE_TYPE_NOT_FOUND,
    RESPONSE_TYPE_UNAUTHORIZED,
    RESPONSE_TYPE_FORBIDDEN,
    RESPONSE_TYPE_THROTTLED,
    RESPONSE_TYPE_SERVER_ERROR,
)


class ApiResponse:
    """Standardized API response handler for consistent response format across all endpoints."""

    @staticmethod
    def core_response(
        success: bool,
        message: str = "",
        data=None,
        errors=None,
        status_code: int = status.HTTP_200_OK,
        response_type: str = RESPONSE_TYPE_SUCCESS,
        code=None,
        debug=None,
        **kwargs,
    ) -> Response:
        """Core method that builds all API responses.
        
        Args:
            success: Whether the request was successful
            message: Human-readable message
            data: Response data (dict, list, or any serializable object)
            errors: Error details (dict, list, or string)
            status_code: HTTP status code
            response_type: Type of response (for frontend handling)
            code: Optional error code
            debug: Debug information (only in development)
            **kwargs: Extra fields (e.g., total, page, has_next for pagination)
        
        Returns:
            Response object with standardized format
        """
        body = {
            "success": success,
            "type": response_type,
            "message": message,
        }

        if data is not None:
            body["data"] = data

        if errors is not None:
            body["errors"] = errors

        if code is not None:
            body["code"] = code

        if debug is not None:
            body["debug"] = debug

        # Any extra kwargs (e.g., total, page, has_next from pagination)
        body.update(kwargs)

        return Response(body, status=status_code)

    # ── Success responses ─────────────────────────────────────

    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK, **kwargs):
        """Standard success response."""
        return ApiResponse.core_response(
            success=True,
            message=message,
            data=data,
            status_code=status_code,
            response_type=RESPONSE_TYPE_SUCCESS,
            **kwargs,
        )

    @staticmethod
    def created(data=None, message="Created successfully"):
        """201 Created response."""
        return ApiResponse.core_response(
            success=True,
            message=message,
            data=data,
            status_code=status.HTTP_201_CREATED,
            response_type=RESPONSE_TYPE_SUCCESS,
        )

    @staticmethod
    def no_content(message="Deleted successfully"):
        """204 No Content response."""
        return ApiResponse.core_response(
            success=True,
            message=message,
            status_code=status.HTTP_204_NO_CONTENT,
            response_type=RESPONSE_TYPE_SUCCESS,
        )

    # ── Error responses ───────────────────────────────────────

    @staticmethod
    def error(message="An error occurred", status_code=status.HTTP_400_BAD_REQUEST,
              errors=None, code=None, **kwargs):
        """Generic error response."""
        return ApiResponse.core_response(
            success=False,
            message=message,
            errors=errors,
            status_code=status_code,
            response_type=RESPONSE_TYPE_ERROR,
            code=code,
            **kwargs,
        )

    @staticmethod
    def validation_error(errors=None, message="Validation failed"):
        """422 Unprocessable Entity - validation errors."""
        return ApiResponse.core_response(
            success=False,
            message=message,
            errors=errors,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            response_type=RESPONSE_TYPE_VALIDATION_ERROR,
        )

    @staticmethod
    def not_found(message="Resource not found"):
        """404 Not Found response."""
        return ApiResponse.core_response(
            success=False,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            response_type=RESPONSE_TYPE_NOT_FOUND,
        )

    @staticmethod
    def unauthorized(message="Unauthorized"):
        """401 Unauthorized response."""
        return ApiResponse.core_response(
            success=False,
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            response_type=RESPONSE_TYPE_UNAUTHORIZED,
        )

    @staticmethod
    def forbidden(message="Forbidden"):
        """403 Forbidden response."""
        return ApiResponse.core_response(
            success=False,
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            response_type=RESPONSE_TYPE_FORBIDDEN,
        )

    @staticmethod
    def throttled(message="Too many requests. Please slow down."):
        """429 Too Many Requests response."""
        return ApiResponse.core_response(
            success=False,
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            response_type=RESPONSE_TYPE_THROTTLED,
        )

    @staticmethod
    def server_error(message="Internal server error", debug=None):
        """500 Internal Server Error response."""
        return ApiResponse.core_response(
            success=False,
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            response_type=RESPONSE_TYPE_SERVER_ERROR,
            debug=debug,
        )
