import urllib.request, json

def post(url, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode())

# ============================================================
# TEST 1: SENTIMENT ANALYSIS
# ============================================================
print('=' * 60)
print('FEATURE 1: SENTIMENT ANALYSIS')
print('=' * 60)

sentiment_tests = [
    'Exceptional work! Delivered on time and exceeded expectations!',
    'Okay work, nothing special really.',
    'Terrible experience. Missed deadlines and ignored messages.',
    'GREAT communicator!! Very professional work!!!',
    'Decent enough I guess.',
    'Worst freelancer I ever hired. Wasted my money.',
    'Absolutely amazing and outstanding results!'
]

for comment in sentiment_tests:
    r = post('http://localhost:5002/ai/sentiment', {'comment': comment})
    short = comment[:52] + '...' if len(comment) > 52 else comment
    label = r['label']
    score = r['score']
    conf = r['confidence']
    print('INPUT    :', short)
    print('RESULT   : Label =', label, '| Score =', score, '| Confidence =', str(round(conf*100, 1)) + '%')
    print()

# ============================================================
# TEST 2: FRAUD DETECTION
# ============================================================
print('=' * 60)
print('FEATURE 2: FRAUD DETECTION')
print('=' * 60)

fraud_tests = [
    {
        'label': 'LEGIT REVIEW (experienced user, normal hour)',
        'data': {'rating': 4, 'hour_posted': 14, 'author_review_count': 12, 'days_since_joined': 300}
    },
    {
        'label': 'SUSPICIOUS (new account, perfect rating, 3am)',
        'data': {'rating': 5, 'hour_posted': 3, 'author_review_count': 0, 'days_since_joined': 1}
    },
    {
        'label': 'SUSPICIOUS (brand new account, first review ever)',
        'data': {'rating': 5, 'hour_posted': 10, 'author_review_count': 0, 'days_since_joined': 2}
    },
    {
        'label': 'LEGIT (negative review from experienced user)',
        'data': {'rating': 1, 'hour_posted': 16, 'author_review_count': 8, 'days_since_joined': 180}
    },
    {
        'label': 'SUSPICIOUS (midnight posting, zero history)',
        'data': {'rating': 5, 'hour_posted': 2, 'author_review_count': 0, 'days_since_joined': 0}
    }
]

for test in fraud_tests:
    r = post('http://localhost:5002/ai/fraud', test['data'])
    print('SCENARIO :', test['label'])
    print('INPUT    :', test['data'])
    flag = 'FLAGGED' if r['is_suspicious'] else 'CLEAN'
    print('RESULT   :', flag, '|', r['risk_level'], '| Anomaly Score:', r['anomaly_score'])
    print('REASON   :', r['reason'])
    print()

# ============================================================
# TEST 3: JOB MATCHING
# ============================================================
print('=' * 60)
print('FEATURE 3: JOB MATCHING (TF-IDF + Cosine Similarity)')
print('=' * 60)

skills = ['React', 'Node.js', 'MongoDB', 'JavaScript', 'CSS']

jobs = [
    {'id': '1', 'title': 'React Frontend Developer', 'description': 'Build modern UI components using React and JavaScript', 'skills': ['React', 'JavaScript', 'CSS'], 'budget': 1500},
    {'id': '2', 'title': 'Python Data Scientist', 'description': 'Analyze datasets and build ML models using Python pandas sklearn', 'skills': ['Python', 'Machine Learning', 'Pandas'], 'budget': 2000},
    {'id': '3', 'title': 'MERN Stack Developer', 'description': 'Full stack development using MongoDB Express React Node.js', 'skills': ['React', 'Node.js', 'MongoDB', 'Express'], 'budget': 2500},
    {'id': '4', 'title': 'Mobile App Developer', 'description': 'Build native iOS and Android apps using Swift and Kotlin', 'skills': ['Swift', 'Kotlin', 'iOS', 'Android'], 'budget': 3000},
    {'id': '5', 'title': 'Backend Node.js Engineer', 'description': 'REST API development with Node.js Express and MongoDB database', 'skills': ['Node.js', 'Express', 'MongoDB'], 'budget': 1800},
    {'id': '6', 'title': 'DevOps Engineer', 'description': 'Setup CI/CD pipelines Docker Kubernetes AWS cloud infrastructure', 'skills': ['Docker', 'Kubernetes', 'AWS'], 'budget': 2200}
]

print('FREELANCER SKILLS:', skills)
print()
r = post('http://localhost:5002/ai/match-jobs', {'skills': skills, 'jobs': jobs})
print('RANKED JOBS (best match first):')
print()
for i, job in enumerate(r):
    bar_len = int(job['match_percent'] / 5)
    bar = '#' * bar_len + '-' * (20 - bar_len)
    print('  #' + str(i+1) + ' [' + bar + '] ' + str(job['match_percent']) + '%  ' + job['match_label'])
    print('     Title  :', job['title'])
    print('     Budget : $' + str(job['budget']))
    print('     Skills :', job['skills'])
    print()
