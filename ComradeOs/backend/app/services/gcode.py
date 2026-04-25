def generate_html_cv(username: str, rep_score: int, completed_quests: list) -> str:
    """
    Takes user's gamified data and translates it into an HTML template
    that the frontend can render or convert to PDF.
    """
    
    quests_html = "".join([f"<li><strong>{q['title']}</strong> - {q['xp']} XP</li>" for q in completed_quests])
    
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{username} - ComradeOS CV</title>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }}
            h1 {{ color: #10B981; }}
            .header {{ border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-bottom: 20px; }}
            .section {{ margin-bottom: 30px; }}
            .rep-badge {{ background: #10B981; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{username}</h1>
            <p>Campus Survivalist & Scholar | <span class="rep-badge">Rep Score: {rep_score}</span></p>
        </div>
        
        <div class="section">
            <h2>Academic Boss Fights Defeated (Quests)</h2>
            <ul>
                {quests_html}
            </ul>
        </div>
        
        <div class="section">
            <h2>Leadership</h2>
            <p>Active participant in the Mbogi Network, managing group treasury and collaborative projects.</p>
        </div>
    </body>
    </html>
    """
    
    return html_template
