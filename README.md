# google-cloud-mlb

## Inspiration

Baseball is a game of precision, timing, and technique, yet not everyone has access to top-tier coaching. Whether you’re a beginner learning the fundamentals or an advanced player refining your swing, personalized feedback can make all the difference. We wanted to bridge the gap between professional coaching and everyday players by harnessing AI to provide real-time, data-driven insights.

## What it does

Slugger Sensei is an AI-powered baseball coach that analyzes a player’s swing mechanics through video input and provides instant feedback to improve their hitting performance. Using computer vision and machine learning, it tracks key metrics such as bat speed, stance, hand positioning, and follow-through, offering personalized recommendations for better accuracy, power, and consistency. Players can upload their swings, compare them to professional athletes, and receive targeted drills to enhance their game.

## How we built it

We leveraged computer vision models trained on thousands of baseball swings to detect key movement patterns. Using OpenCV and MediaPipe, we tracked skeletal motion, while TensorFlow powered our AI models to analyze performance metrics. The backend was built with FastAPI, handling video processing and model inference efficiently, and deployed on Google Cloud Run for scalability. The frontend provides an intuitive dashboard where users can upload videos, view analytics, and receive AI-generated coaching feedback.

## Challenges we ran into

One of the biggest challenges was ensuring real-time feedback while processing high-resolution video. Optimizing model inference speed without compromising accuracy was tricky. Additionally, fine-tuning the AI to differentiate between small yet significant differences in swing mechanics required extensive training data and validation. Lastly, deploying the system on Cloud Run presented hurdles in managing video processing workloads efficiently.

## Accomplishments that we’re proud of:
- Successfully implemented real-time AI-driven swing analysis that provides actionable feedback.
- Optimized video processing to run smoothly on Google Cloud Run, ensuring scalability.
- Developed an intuitive user interface that makes AI coaching accessible to players of all skill levels.
- Trained a robust model that can detect and suggest corrections for swing mechanics with high accuracy.

## What we learned

This project reinforced the importance of efficient model deployment and optimization, especially when handling computationally expensive tasks like video processing. We also learned how to fine-tune AI models for motion analysis and integrate computer vision pipelines into a production-ready environment. Lastly, we gained a deeper appreciation for user experience design, ensuring that AI-generated insights are presented in an easy-to-understand manner for athletes.

## What’s next for Slugger Sensei: AI Baseball Coach

We plan to expand Slugger Sensei’s capabilities by incorporating pitch recognition analysis, allowing batters to train against different pitch types. Additionally, we aim to develop a mobile app for on-the-go swing analysis and integrate real-time feedback via AR overlays. Beyond baseball, we see potential in applying this technology to other sports that rely on biomechanics, such as golf and tennis.

Slugger Sensei is just getting started—our goal is to revolutionize sports training with AI-powered coaching for everyone!
