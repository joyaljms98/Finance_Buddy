from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "User" # Admin | Editor | User
    is_onboarded: bool = False
    status: str = "Active"

class UserCreate(UserBase):
    password: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class UserInDB(UserBase):
    id: str
    user_id: str
    hashed_password: str
    created_at: datetime

class UserResponse(UserBase):
    id: str
    user_id: str
    created_at: datetime

class TaxProfile(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    profileFor: Optional[str] = "me (main)"
    name: Optional[str] = None
    dob: Optional[str] = None
    ageCategory: Optional[str] = None
    residentialStatus: Optional[str] = None
    residentSubStatus: Optional[str] = None
    stayDaysInIndia: Optional[float] = None
    employmentSource: Optional[str] = None
    isGovtEmployee: bool = False
    businessTurnover: Optional[float] = None
    professionalReceipts: Optional[float] = None
    optPresumptiveTax: bool = False
    auditRequired: bool = False
    maritalStatus: Optional[str] = None
    taxFilingStatus: Optional[str] = None
    spouseAssetTransfer: bool = False
    childrenCount: Optional[int] = None
    payTuitionFee: bool = False
    minorChildIncome: bool = False
    dependentDisability: bool = False
    taxRegime: Optional[str] = None
    selfDisability: Optional[str] = None
    specificDisease: bool = False
    hasVDA: bool = False
    hasCapitalGains: bool = False
    hasHealthInsurance: bool = False
    hasLifeInsurance: bool = False
    annualIncome: Optional[float] = None
    monthlyExpenses: Optional[float] = None
    savings: Optional[float] = None
    riskTolerance: Optional[str] = None
    goals: Optional[str] = None
    updated_at: Optional[datetime] = None
