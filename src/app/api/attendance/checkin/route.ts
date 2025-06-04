import { NextRequest, NextResponse } from "next/server";

import { ICheckInRequest, ICheckInResponse } from "@/types/attendance.type";

// This is a placeholder API route - replace with actual backend integration
export async function POST(request: NextRequest) {
  try {
    const body: ICheckInRequest = await request.json();

    // TODO: Replace with actual API call to your backend
    // Example:
    // const response = await fetch(`${process.env.BACKEND_URL}/api/attendance/checkin`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: JSON.stringify(body),
    // });

    // Mock response for development
    const mockResponse: ICheckInResponse = {
      message: "Check-in successful",
      data: {
        id: Date.now(),
        employee_id: body.employee_id,
        date: new Date().toISOString().split("T")[0],
        type: body.type,
        checkin_time: new Date().toISOString(),
        checkout_time: null,
        total_work_hours: null,
        status: "incomplete",
        description: null,
        branch_name: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
