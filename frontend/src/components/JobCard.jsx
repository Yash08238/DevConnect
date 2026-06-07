import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from './ui/Badge';
import timeAgo from '../utils/timeAgo';

export default function JobCard({ job }) {
  const { user } = useAuth();
  
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
    <div className="glass-card job-item fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: 0 }}>
        {/* Company Logo */}
        <div style={{ flexShrink: 0 }}>
          {job.company?.logo?.url ? (
            <img
              src={job.company.logo.url}
              className="job-logo"
              alt={`${job.company.name} logo`}
            />
          ) : (
            <div className="job-logo">
              {job.company?.name?.charAt(0) || 'J'}
            </div>
          )}
        </div>

        {/* Content details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <Link to={`/jobs/${job._id}`}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-white)' }}>
                {job.title}
              </h3>
            </Link>
            {hasApplied && (
              <Badge variant="accent" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)', fontSize: '0.65rem' }}>
                Applied
              </Badge>
            )}
            {job.status !== 'open' && (
              <Badge style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.65rem' }}>
                Closed
              </Badge>
            )}
          </div>

          <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px' }}>
            {job.company?.name}
          </div>

          {/* Meta items grid */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} />
              <span>{job.location} ({job.workMode})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Briefcase size={14} />
              <span style={{ textTransform: 'capitalize' }}>{job.type} • {job.experienceLevel}</span>
            </div>
            {job.salary?.isPublic && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={14} />
                <span>{formatSalary()}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              <span>Posted {timeAgo(job.createdAt)}</span>
            </div>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {job.tags.map((tag, i) => (
                <Badge key={i} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Action */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '8px' }}>
        <Link to={`/jobs/${job._id}`} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
          Details
        </Link>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {job.applicants?.length || 0} applicants
        </span>
      </div>
    </div>
  );
}
