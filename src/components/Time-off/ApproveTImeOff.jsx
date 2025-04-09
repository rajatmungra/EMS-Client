import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/authContext'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { CgSpinner } from "react-icons/cg"
import moment from 'moment'

const ApproveTimeOff = () => {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null) // Track which leave is being processed
    const { getToken, getuser } = useContext(UserContext)

    useEffect(() => {
        const fetchAllLeaves = async () => {
            try {
                const token = getToken()
                const user_id = getuser().user.id
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/leave/to-approve/${user_id}`,
                    {
                        headers: { Authorization: `Bearer ${token}`}
                    }
                )
                setLeaves(response.data.leaves)
            } catch (error) {
                toast.error(error.response?.data?.message || error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchAllLeaves()
    }, [])

    const handleDecision = async (leaveId, decision) => {
        try {
            setProcessing(leaveId)
            const token = getToken()
            await axios.put(
                `${import.meta.env.VITE_API_URL}/leave/approve/${leaveId}`,
                { status: decision },
                { headers: { Authorization: `Bearer ${token}`} }
            )
            setLeaves(prev =>
                prev.map(leave =>
                    leave._id === leaveId ? { ...leave, status: decision } : leave
                )
            )
            toast.success(`Leave ${decision === 'approved' ? 'approved' : 'refused'} successfully`)
        } catch (error) {
            toast.error(error.response?.data?.message || `Unable to update the`)
        } finally {
            setProcessing(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <CgSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Leave to Approve/Refuse</h1>

            {leaves.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">No leaves pending your approval</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaves.map(leave => (
                                <tr key={leave._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {leave.employee.avatar && (
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover mr-3"
                                                    src={leave.employee.avatar}
                                                    alt={leave.employee.name}
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{leave.employee.name}</div>
                                                <div className="text-sm text-gray-500">{leave.employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {leave.allocation.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {moment(leave.dateFrom).format('MMM D, YYYY')} - {moment(leave.dateTo).format('MMM D, YYYY')}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {moment(leave.dateTo).diff(moment(leave.dateFrom), 'days') + 1} days
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                        {leave.description || 'No reason provided'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                        {leave.status }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleDecision(leave._id, 'approved')}
                                                disabled={processing === leave._id || leave.status === 'approved'}
                                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center cursor-pointer"
                                            >
                                                {processing === leave._id ? (
                                                    <CgSpinner className="animate-spin mr-1" />
                                                ) : null}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleDecision(leave._id, 'refused')}
                                                disabled={processing === leave._id || leave.status === 'refused'}
                                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center cursor-pointer"
                                            >
                                                {processing === leave._id ? (
                                                    <CgSpinner className="animate-spin mr-1" />
                                                ) : null}
                                                Refuse
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ToastContainer position="bottom-right"/>
        </div>
    )
}

export default ApproveTimeOff
