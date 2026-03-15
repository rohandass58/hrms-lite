from rest_framework import status


class AppException(Exception):
    """Base class for all app-level exceptions.
    Subclasses declare their own status_code and detail at the class level,
    so the global handler can convert them uniformly to {"error": "..."}.
    """
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail = "An unexpected error occurred."

    def __init__(self, detail=None):
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)

