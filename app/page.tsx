"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, Clock, User } from "lucide-react"

export default function Home() {
  const [members, setMembers] = useState<{ name: string; role: string }[]>([])
  const [selectedMember, setSelectedMember] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [fetchingMembers, setFetchingMembers] = useState(true)
  const [checkInTime, setCheckInTime] = useState("")
  const [checkedInMember, setCheckedInMember] = useState("")

  useEffect(() => {
    setFetchingMembers(true)
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(Array.isArray(data) ? data : [])
        setFetchingMembers(false)
      })
      .catch((err) => {
        console.error("Error fetching members:", err)
        setMessage("Failed to load member list")
        setMessageType("error")
        setFetchingMembers(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) {
      setMessage("Please select a member")
      setMessageType("error")
      return
    }

    setLoading(true)
    setMessage("")
    setMessageType("")

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedMember }),
      })
      const data = await res.json()

      if (res.ok) {
        const now = new Date()
        const timeString = now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        const dateString = now.toLocaleDateString("en-US")

        setCheckInTime(`${timeString} - ${dateString}`)
        setCheckedInMember(selectedMember)
        setMessage("Check-in successful!")
        setMessageType("success")
        setSelectedMember("")
      } else {
        setMessage(data.error || "Check-in failed")
        setMessageType("error")
      }
    } catch (err) {
      console.error("Error submitting check-in:", err)
      setMessage("Error submitting check-in")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckInAnother = () => {
    setMessage("")
    setMessageType("")
    setCheckedInMember("")
    setCheckInTime("")
  }

  const selectedMemberData = members.find((member) => member.name === selectedMember)

  if (messageType === "success" && checkedInMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Hệ Thống Chấm Công</CardTitle>
            <CardDescription className="text-gray-600">Chấm công hàng ngày cho nhân viên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-green-700">Chấm công thành công!</h3>
              <p className="text-lg font-medium text-gray-900">{checkedInMember}</p>
              <p className="text-sm text-gray-600">Thời gian: {checkInTime}</p>
            </div>

            <Button onClick={handleCheckInAnother} variant="outline" className="w-full mt-6">
              Chấm công nhân viên khác
            </Button>

            <p className="text-xs text-gray-500 mt-4">
              Hệ thống chấm công tự động - {new Date().toLocaleDateString("en-US")}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Hệ Thống Chấm Công</CardTitle>
          <CardDescription className="text-gray-600">Chấm công hàng ngày cho nhân viên</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="member-select" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                Chọn Nhân Viên
              </Label>
              <Select value={selectedMember} onValueChange={setSelectedMember} disabled={fetchingMembers || loading}>
                <SelectTrigger id="member-select" className="w-full">
                  <SelectValue placeholder={fetchingMembers ? "Đang tải..." : "-- Chọn nhân viên --"} />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.name} value={member.name}>
                      <div className="flex items-center gap-2">
                        <span>{member.name}</span>
                        {member.role && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMemberData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{selectedMemberData.name}</span>
                  {selectedMemberData.role && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {selectedMemberData.role}
                    </span>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
              disabled={loading || fetchingMembers || !selectedMember}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-5 w-5" />
                  Chấm Công
                </>
              )}
            </Button>
          </form>

          {message && messageType === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{message}</AlertDescription>
            </Alert>
          )}

          {fetchingMembers && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Đang tải danh sách nhân viên...</span>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            Hệ thống chấm công tự động - {new Date().toLocaleDateString("en-US")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
