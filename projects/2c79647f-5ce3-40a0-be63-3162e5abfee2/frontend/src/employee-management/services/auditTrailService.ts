// Audit trail service for frontend
import axios from 'axios';

const API_URL = '/api/employees';

const getAuditTrail = async (employeeId: string) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/${employeeId}/audit`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export default { getAuditTrail };
