import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { Briefcase, MapPin, DollarSign, Calendar, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import timeAgo from '../utils/timeAgo';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getJob(id);
      if (res.success && res.data) {
        setJob(res.data);
      }
    } catch (err) {
      setError(err.message || 'Job listing not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleApply = async () => {
    if (!user) return navigate('/login');
    if (applyLoading) return;

    try {
      setApplyLoading(true);
      const res = await api.applyJob(job._id);
      if (res.success) {
        setJob((prev) => ({
          ...prev,
          applicants: [...(prev.applicants || []), { user: user._id }]
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading && !job) return <Spinner size="large" />;
  if (error) return <div style={{ color: 'var(--error)', padding: '40px', textAlign: 'center' }}><h3>{error}</h3><button onClick={() => navigate('/jobs')} className="btn btn-secondary" style={{ marginTop: '14px' }}>Back to Job Board</button></div>;
  if (!job) return null;

  const hasApplied = user && job.applicants?.some(
    (applicant) => (applicant.user?._id || applicant.user) === user._id
  );

  const formatSalary = () => {
    if (!job.salary || !job.salary.min) return 'Salary not specified';
    const { min, max, currency, period } = job.salary;
    const maxStr = max ? ` - $${max.toLocaleString()}` : '';
    return `$${min.toLocaleString()}${maxStr} ${currency} / ${period}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <button onClick={() => navigate('/jobs')} className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', padding: '0', marginBottom: '4px' }}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      {/* Main Details Card */}
      <div className="glass-card fade-in" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Logo */}
            {job.company?.logo?.url ? (
              <img
                src={job.company.logo.url}
                style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                alt=""
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifySelf: 'center', fontWeight: 'bold', fontSize: '2rem', justifyContent: 'center' }}>
                {job.company?.name?.charAt(0) || 'J'}
              </div>
            )}

            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: '700' }}>{job.title}</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{job.company?.name}</span>
                {job.company?.website && (
                  <a href={job.company.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    ({job.company.website})
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleApply}
            className="btn btn-primary"
            disabled={hasApplied || job.status !== 'open' || applyLoading}
            style={{ padding: '10px 24px', fontSize: '0.95rem' }}
          >
            {hasApplied ? (
              <span>Applied</span>
            ) : job.status !== 'open' ? (
              <span>Closed</span>
            ) : (
              <>
                <Send size={16} style={{ color: 'var(--bg-darker)' }} />
                <span style={{ color: 'var(--bg-darker)' }}>Apply Now</span>
              </>
            )}
          </button>
        </div>

        {/* Metadata Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Location</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-white)' }}>
              <MapPin size={16} />
              <span>{job.location}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Job Type & Mode</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-white)', textTransform: 'capitalize' }}>
              <Briefcase size={16} />
              <span>{job.type} • {job.workMode}</span>
            </div>
          </div>

          {job.salary?.isPublic && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Salary</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-white)' }}>
                <DollarSign size={16} />
                <span>{formatSalary()}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Posted Date</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-white)' }}>
              <Calendar size={16} />
              <span>{new Date(job.createdAt).toLocaleDateString()} ({timeAgo(job.createdAt)})</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ textItems: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Job Description</h3>
          <p style={{ fontSize: '0.98rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
            {job.description}
          </p>
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Tech Stack & Skills</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {job.tags.map((tag, i) => (
                <Badge key={i} variant="accent" style={{ padding: '4px 10px' }}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
