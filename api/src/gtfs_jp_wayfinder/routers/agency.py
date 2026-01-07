from fastapi import APIRouter

from gtfs_jp_wayfinder import models
from gtfs_jp_wayfinder.services import wayfinder_adapter as adapter

router = APIRouter()


@router.get(
    "",
    response_model=models.AgencyListResponse,
    summary="事業者情報の取得",
    description="GTFS-JPデータに含まれる事業者情報（agency.txt）をJSON形式で返します。",
    responses={
        200: {
            "description": "成功",
            "content": {
                "application/json": {
                    "example": {
                        "agencies": [
                            {
                                "agency_id": "3410001000459",
                                "agency_name": "秋田中央交通",
                                "agency_url": "https://www.akita-chuoukotsu.co.jp/",
                                "agency_timezone": "Asia/Tokyo",
                                "agency_lang": "ja",
                                "agency_phone": None,
                                "agency_fare_url": None,
                            },
                        ],
                    },
                },
            },
        },
    },
)
async def get_agencies():
    """Get transit agency information from GTFS data.

    Returns information about the transit agencies providing the service,
    including name, URL, timezone, and contact details.

    Note: Currently returns a single agency, but the structure supports
    multiple agencies for future GTFS-JP data with multiple providers.
    """
    agency_data = adapter.get_agency_info()
    # Convert list of dicts to list of Agency models
    agencies = [models.Agency(**agency) for agency in agency_data]
    return models.AgencyListResponse(agencies=agencies)
