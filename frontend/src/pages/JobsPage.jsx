import { useState, useEffect } from 'react';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Briefcase, Plus, Filter } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters State
  const [workMode, setWorkMode] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [type, setType] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Remote');
  const [jobType, setJobType] = useState('full-time');
  const [jobWorkMode, setJobWorkMode] = useState('remote');
  const [expLevel, setExpLevel] = useState('mid');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [tags, setTags] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (workMode) filters.workMode = workMode;
      if (experienceLevel) filters.experienceLevel = experienceLevel;
      if (type) filters.type = type;

      const res = await api.getJobs(filters);
      if (res.success && res.data?.jobs) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode, experienceLevel, type]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!title || !companyName || !description) {
      setError('Title, company name, and description are required');
      return;
    }

    try {
      setFormLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('type', jobType);
      formData.append('workMode', jobWorkMode);
      formData.append('experienceLevel', expLevel);

      formData.append('company[name]', companyName);
      if (companyWebsite) formData.append('company[website]', companyWebsite);

      const salaryObj = {
        min: Number(salaryMin) || undefined,
        max: Number(salaryMax) || undefined,
        isPublic: true,
      };
      formData.append('salary[min]', salaryMin);
      formData.append('salary[max]', salaryMax);
      formData.append('salary[isPublic]', 'true');

      const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      formData.append('tags', JSON.stringify(parsedTags));

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await api.createJob(formData);
      if (res.success) {
        // Reset states
        setTitle('');
        setCompanyName('');
        setCompanyWebsite('');
        setDescription('');
        setLocation('Remote');
        setJobType('full-time');
        setJobWorkMode('remote');
        setExpLevel('mid');
        setSalaryMin('');
        setSalaryMax('');
        setTags('');
        setLogoFile(null);
        setIsModalOpen(false);
        // Refresh list
        fetchJobs();
      }
    } catch (err) {
      setError(err.message || 'Failed to post job');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Job Board</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '4px' }}>Explore developer jobs or hire talent for your project</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={16} style={{ color: 'var(--bg-darker)' }} />
          <span style={{ color: 'var(--bg-darker)' }}>Post a Job</span>
        </Button>
      </div>

      {/* Filters Row */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '12px 16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-white)', fontSize: '0.85rem' }}>
          <Filter size={16} />
          <span style={{ fontWeight: '600' }}>Filters:</span>
        </div>

        <select className="form-control" value={workMode} onChange={(e) => setWorkMode(e.target.value)} style={{ width: 'auto', height: '34px', padding: '4px 10px', fontSize: '0.85rem' }}>
          <option value="">All Work Modes</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-Site</option>
        </select>

        <select className="form-control" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} style={{ width: 'auto', height: '34px', padding: '4px 10px', fontSize: '0.85rem' }}>
          <option value="">All Experience Levels</option>
          <option value="entry">Entry Level</option>
          <option value="mid">Mid Level</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
          <option value="executive">Executive</option>
        </select>

        <select className="form-control" value={type} onChange={(e) => setType(e.target.value)} style={{ width: 'auto', height: '34px', padding: '4px 10px', fontSize: '0.85rem' }}>
          <option value="">All Types</option>
          <option value="full-time">Full-Time</option>
          <option value="part-time">Part-Time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="freelance">Freelance</option>
        </select>
      </div>

      {/* Jobs List */}
      {loading ? (
        <Spinner size="large" />
      ) : jobs.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
          <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3>No jobs found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Try modifying your filter settings.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {/* Job Post Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post a New Job">
        {error && (
          <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior React Developer" required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" required />
            <Input label="Company Website" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="e.g. https://acme.co" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote or San Francisco, CA" />
            <div className="form-group">
              <label>Company Logo</label>
              <input type="file" onChange={(e) => setLogoFile(e.target.files[0])} accept="image/*" className="form-control" style={{ fontSize: '0.85rem', padding: '6px 12px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Job Type</label>
              <select className="form-control" value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ fontSize: '0.85rem' }}>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Work Mode</label>
              <select className="form-control" value={jobWorkMode} onChange={(e) => setJobWorkMode(e.target.value)} style={{ fontSize: '0.85rem' }}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-Site</option>
              </select>
            </div>
            <div className="form-group">
              <label>Experience Level</label>
              <select className="form-control" value={expLevel} onChange={(e) => setExpLevel(e.target.value)} style={{ fontSize: '0.85rem' }}>
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Salary Range (Min USD/yr)" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="e.g. 80000" />
            <Input label="Salary Range (Max USD/yr)" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="e.g. 120000" />
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide full details, requirements, stack used..." style={{ minHeight: '120px' }} required />
          </div>

          <Input label="Keywords / Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. react, node, graphql" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
