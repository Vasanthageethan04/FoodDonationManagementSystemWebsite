import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Download, Check, RefreshCw } from 'lucide-react';

const ReportsPanel = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form selections
  const [reportType, setReportType] = useState('Donation'); // Donation, Volunteer, NGO
  const [reportFormat, setReportFormat] = useState('CSV'); // CSV, PDF

  const [generatedReport, setGeneratedReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await api.get('/Reports');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedReport(null);

    try {
      const response = await api.post(`/Reports/generate?type=${reportType}&format=${reportFormat}`);
      setGeneratedReport(response.data);
      alert('Report generated successfully!');
      fetchReports();
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Utility to download JSON report data as a client-side CSV file
  const downloadCsv = (data, filename) => {
    if (!data || data.length === 0) return;
    
    // Create CSV header dynamically from object keys
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Reports History...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>System Reports</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Generate audit logs, donor summaries, NGO records, and download export logs</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Generate Panel Form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            Configure Report Generator
          </h3>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Report Type</label>
              <select 
                className="form-input" 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Donation">Donation Report</option>
                <option value="Volunteer">Volunteer Performance</option>
                <option value="NGO">NGO Allocation Records</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Export Format</label>
              <select 
                className="form-input" 
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
              >
                <option value="CSV">Comma Separated Values (CSV)</option>
                <option value="PDF">Portable Document Format (PDF)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={generating}
            >
              {generating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Generating file...
                </>
              ) : (
                'Generate and Run Report'
              )}
            </button>
          </form>
        </div>

        {/* View Generated Report Output & Downloads */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Active Generation Preview panel */}
          {generatedReport && (
            <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 'bold' }}>{generatedReport.report.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Created just now - JSON Data Preview</p>
                </div>
                <button 
                  onClick={() => downloadCsv(generatedReport.data.details, generatedReport.report.name)}
                  className="btn btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                >
                  <Download size={12} />
                  Download CSV
                </button>
              </div>

              {/* Data Table Preview */}
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {Object.keys(generatedReport.data.details[0] || {}).map((key) => (
                        <th key={key} style={{ padding: '10px' }}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.data.details.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, valIdx) => (
                          <td key={valIdx} style={{ padding: '10px' }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Historical Log */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '20px' }}>Report Export Log history</h3>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Date Generated</th>
                    <th>Generated By</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No reports generated yet.</td>
                    </tr>
                  ) : (
                    reports.map((rep) => (
                      <tr key={rep.id}>
                        <td style={{ fontWeight: '600' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} style={{ color: 'var(--primary)' }} />
                            {rep.name}
                          </span>
                        </td>
                        <td>{rep.type}</td>
                        <td>
                          <span className="badge badge-assigned" style={{ fontSize: '10px' }}>
                            {rep.format}
                          </span>
                        </td>
                        <td>{new Date(rep.createdAt).toLocaleString()}</td>
                        <td>{rep.generatedByName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ReportsPanel;
