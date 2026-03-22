import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

function GroupMembers() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/groups/${groupId}`),
      api.get(`/groups/${groupId}/members`),
    ]).then(([groupRes, membersRes]) => {
      setGroupName(groupRes.data.name);
      setMembers(membersRes.data.filter(m => m.role === 'ADMIN' || m.status === 'APPROVED'));
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [groupId]);

  const admins  = members.filter(m => m.role === 'ADMIN');
  const regular = members.filter(m => m.role !== 'ADMIN');

  const MemberCard = ({ m }) => (
    <div style={styles.card}>
      <div style={styles.avatar}>
        {m.profileImage
          ? <img src={`http://localhost:8080/uploads/${m.profileImage}`} alt="" style={styles.avatarImg} />
          : <span style={styles.avatarLetter}>{(m.userName || '?')[0].toUpperCase()}</span>
        }
        {m.role === 'ADMIN' && <span style={styles.adminBadge}>👑</span>}
      </div>
      <div style={styles.info}>
        <span style={styles.name}>{m.userName}</span>
        <span style={styles.email}>{m.email}</span>
        {m.field && <span style={styles.tag}>{m.field}</span>}
      </div>
      <span style={{ ...styles.rolePill, ...(m.role === 'ADMIN' ? styles.roleAdmin : styles.roleMember) }}>
        {m.role === 'ADMIN' ? 'Admin' : 'Member'}
      </span>
    </div>
  );

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(`/groups/${groupId}/chat`)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Chat
          </button>
          <div>
            <h2 style={styles.title}>{groupName} — Members</h2>
            <p style={styles.subtitle}>{members.length} approved member{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div style={styles.center}>
            <div style={styles.spinner} />
          </div>
        ) : (
          <div style={styles.content}>
            {admins.length > 0 && (
              <section>
                <p style={styles.sectionLabel}>Admins</p>
                {admins.map(m => <MemberCard key={m.userId} m={m} />)}
              </section>
            )}
            {regular.length > 0 && (
              <section>
                <p style={styles.sectionLabel}>Members</p>
                {regular.map(m => <MemberCard key={m.userId} m={m} />)}
              </section>
            )}
            {members.length === 0 && (
              <div style={styles.center}><p style={{ color: '#9ca3af' }}>No members found.</p></div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  page: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  header: { marginBottom: 24 },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#6366f1', fontWeight: 600, fontSize: 14, padding: '6px 0', marginBottom: 12,
  },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#6b7280' },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase',
    letterSpacing: '0.08em', margin: '20px 0 8px',
  },
  content: {},
  card: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#fff', borderRadius: 12, padding: '12px 16px',
    marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
    border: '1px solid #f3f4f6',
  },
  avatar: { position: 'relative', flexShrink: 0 },
  avatarImg: { width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', display: 'block' },
  avatarLetter: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff', fontWeight: 700, fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  adminBadge: {
    position: 'absolute', bottom: -2, right: -2,
    fontSize: 13, lineHeight: 1,
  },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' },
  name: { fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  email: { fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tag: {
    display: 'inline-block', fontSize: 11, color: '#6366f1',
    background: '#ede9fe', borderRadius: 6, padding: '1px 7px', marginTop: 2, width: 'fit-content',
  },
  rolePill: { fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px', flexShrink: 0 },
  roleAdmin:  { background: '#fef3c7', color: '#92400e' },
  roleMember: { background: '#f0fdf4', color: '#166534' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 },
  spinner: {
    width: 32, height: 32, borderRadius: '50%',
    border: '3px solid #e5e7eb', borderTopColor: '#6366f1',
    animation: 'spin 0.7s linear infinite',
  },
};

export default GroupMembers;
