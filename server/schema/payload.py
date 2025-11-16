from pydantic import BaseModel, Field
from typing import List, Optional

class fieldValues(BaseModel):
  EXCLUDE: Optional[bool]
  OPT: Optional[str]
  LOW: Optional[str]
  HIGH: Optional[str]

class fieldHeader(BaseModel):
  fieldName: str
  values: List[fieldValues]

class objectHeader(BaseModel):
  objectName: str
  variantName: str

class objectData(BaseModel):
  objectName: str
  variantName: str
  fields: List[fieldHeader]