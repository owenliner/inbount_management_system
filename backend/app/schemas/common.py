"""Common schemas for API responses."""

from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel

T = TypeVar("T")


class Response(BaseModel, Generic[T]):
    """Standard API response wrapper."""

    code: int = 0
    msg: str = "success"
    data: Optional[T] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""

    records: List[T]
    total: int
    size: int
    current: int
    pages: int


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = 1
    size: int = 10
