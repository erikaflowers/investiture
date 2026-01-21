import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@investiture/hooks';

/**
 * Dashboard - Create new braindump + list existing projects
 * Matches vanilla list-view functionality
 */
function Dashboard() {
  const { supabase, user } = useSupabase();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New braindump state
  const [braindumpText, setBraindumpText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('projects')
          .select('id, title, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (queryError) throw queryError;

        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, supabase]);

  const handleProjectClick = (project) => {
    navigate(`/project/${project.id}`);
  };

  const handleSaveBraindump = async () => {
    if (!braindumpText.trim()) {
      setSaveError('Please enter your idea first!');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      // 1. Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: 'Braindump Session',
          status: 'braindump',
          user_id: user.id
        })
        .select()
        .single();

      if (projectError) throw new Error(`Project creation failed: ${projectError.message}`);

      // 2. Create the braindump
      const { error: braindumpError } = await supabase
        .from('braindumps')
        .insert({
          project_id: project.id,
          raw_input: braindumpText.trim()
        });

      if (braindumpError) throw new Error(`Braindump save failed: ${braindumpError.message}`);

      // 3. Generate title (wait for it so it shows immediately)
      try {
        console.log('[Dashboard] Generating title for project:', project.id);
        const titleRes = await fetch('/.netlify/functions/generate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ braindump: braindumpText.trim() })
        });

        console.log('[Dashboard] Title response status:', titleRes.status);

        if (titleRes.ok) {
          const titleData = await titleRes.json();
          console.log('[Dashboard] Title data:', titleData);

          if (titleData.title) {
            const { error: titleUpdateError } = await supabase
              .from('projects')
              .update({ title: titleData.title })
              .eq('id', project.id);

            if (titleUpdateError) {
              console.error('[Dashboard] Title update failed:', titleUpdateError);
            } else {
              console.log('[Dashboard] Title updated successfully:', titleData.title);
            }
          }
        } else {
          const errorText = await titleRes.text();
          console.error('[Dashboard] Title generation response not OK:', errorText);
        }
      } catch (err) {
        console.error('[Dashboard] Title generation failed:', err);
        // Continue anyway - title is nice-to-have
      }

      // 4. Navigate to the new project
      navigate(`/project/${project.id}`);

    } catch (err) {
      console.error('Save braindump error:', err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* New Braindump Section */}
      <div style={styles.newSection}>
        <h2 style={styles.title}>Okay, what's your big idea?</h2>
        <p style={styles.subtitle}>Pour it all out. Stream of consciousness. Don't hold back.</p>

        <textarea
          style={styles.textarea}
          value={braindumpText}
          onChange={(e) => setBraindumpText(e.target.value)}
          placeholder="A detective who can taste lies... A world where dreams are currency... What if the moon was actually..."
          rows={6}
        />

        <button
          style={{
            ...styles.saveBtn,
            opacity: saving ? 0.7 : 1
          }}
          onClick={handleSaveBraindump}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save My Braindump'}
        </button>

        {saveError && (
          <p style={styles.error}>{saveError}</p>
        )}
      </div>

      {/* Existing Projects Section */}
      <div style={styles.existingSection}>
        <h3 style={styles.existingTitle}>Recent Projects</h3>

        {loading && <p style={styles.loadingText}>Loading...</p>}

        {error && <p style={styles.error}>Error: {error}</p>}

        {!loading && !error && projects.length === 0 && (
          <p style={styles.emptyText}>No projects yet. Add your first idea above!</p>
        )}

        {!loading && !error && projects.length > 0 && (
          <div style={styles.projectsGrid}>
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                style={styles.projectCard}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <h4 style={styles.projectTitle}>
                  {project.title || 'Untitled Project'}
                </h4>
                <p style={styles.projectStatus}>
                  {project.status || 'draft'}
                </p>
                <p style={styles.projectDate}>
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto'
  },
  // New braindump section
  newSection: {
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '32px',
    textAlign: 'center'
  },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.75rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '1rem',
    color: '#8B7D6B',
    margin: '0 0 24px 0'
  },
  textarea: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontFamily: "'Source Sans 3', sans-serif",
    color: '#2C2416',
    background: '#FAF6F1',
    border: '2px solid #D9CFC2',
    borderRadius: '8px',
    resize: 'vertical',
    minHeight: '150px',
    lineHeight: 1.6,
    boxSizing: 'border-box'
  },
  saveBtn: {
    marginTop: '16px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    color: 'white',
    background: '#B85C38',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif",
    transition: 'background 0.15s ease'
  },
  error: {
    marginTop: '12px',
    color: '#DC3545',
    fontSize: '14px'
  },
  // Existing projects section
  existingSection: {
    marginTop: '24px'
  },
  existingTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #B85C38'
  },
  loadingText: {
    color: '#8B7D6B',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '24px'
  },
  emptyText: {
    color: '#8B7D6B',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '24px',
    background: '#FAF6F1',
    borderRadius: '8px'
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  projectCard: {
    padding: '16px',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s'
  },
  projectTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: '0 0 8px 0'
  },
  projectStatus: {
    fontSize: '13px',
    color: '#8B7D6B',
    margin: '0 0 4px 0',
    textTransform: 'capitalize'
  },
  projectDate: {
    fontSize: '12px',
    color: '#A89F91',
    margin: 0
  }
};

export default Dashboard;
