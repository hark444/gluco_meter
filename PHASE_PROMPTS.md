# Phase Implementation Prompts for Gluco Meter ML Features

## Phase 4: ML Infrastructure Setup

**Prompt:**
```
I need to set up the machine learning infrastructure for my glucose meter application. The application tracks blood sugar readings along with health metrics (step_count, sleep_hours, calorie_count, protein_intake_g, carb_intake_g, exercise_minutes).

Please implement the following:

1. Create a new directory structure `backend/app/ml/` with subdirectories:
   - `models/` - for storing trained model files
   - `training/` - for training scripts
   - `predictions/` - for prediction utilities

2. Add ML dependencies to `backend/requirements.txt`:
   - scikit-learn (for regression models)
   - pandas (for data processing)
   - numpy (for numerical operations)
   - joblib (for model serialization)
   - Optionally: xgboost and lightgbm for advanced models

3. Create `backend/app/ml/training/data_export.py`:
   - Function to export readings from database to pandas DataFrame
   - Should include all health metrics and blood sugar values
   - Handle missing values appropriately
   - Filter by user_id for user-specific models

4. Create `backend/app/ml/training/train_blood_sugar_predictor.py`:
   - Script to train a regression model that predicts blood sugar from health metrics
   - Input features: step_count, sleep_hours, calorie_count, protein_intake_g, carb_intake_g, exercise_minutes
   - Target: value_ng_ml (blood sugar reading)
   - Use train/test split
   - Save model to `backend/app/ml/models/blood_sugar_predictor.joblib`
   - Include model evaluation metrics (R², MAE, RMSE)
   - Handle cases with insufficient data gracefully

5. Create `backend/app/ml/predictions/predictor.py`:
   - Function to load trained model
   - Function to make predictions given health metrics
   - Include error handling for missing models or invalid inputs

6. Create `backend/app/ml/training/train_recommendations.py`:
   - Script for generating recommendations (inverse prediction)
   - Approach: Use optimization or inverse model to recommend health metrics for target blood sugar
   - Save recommendation model/algorithm to `backend/app/ml/models/recommendations.joblib`

7. Add model versioning:
   - Create `backend/app/ml/models/.gitkeep` to ensure directory exists
   - Consider adding a version file or metadata JSON

8. Update `.gitignore` to exclude model files if they're large (optional):
   - Add `*.joblib` or specific model files if needed
```

---

## Phase 5: ML Model Development

**Prompt:**
```
I need to develop and refine the machine learning models for blood sugar prediction and recommendations. The models should learn from user health metrics to predict blood sugar levels and provide recommendations.

Please implement:

1. Enhance `backend/app/ml/training/train_blood_sugar_predictor.py`:
   - Implement multiple model types (Linear Regression, Random Forest, Gradient Boosting)
   - Add model comparison and selection based on performance
   - Include feature importance analysis
   - Add cross-validation for better model evaluation
   - Handle missing values in training data (imputation strategies)
   - Save best model with metadata (training date, performance metrics, feature list)

2. Create `backend/app/ml/training/model_evaluator.py`:
   - Function to evaluate model performance
   - Calculate R², MAE, RMSE, MAPE
   - Generate evaluation report
   - Visualize predictions vs actuals (optional, if matplotlib available)

3. Enhance `backend/app/ml/training/train_recommendations.py`:
   - Implement recommendation algorithm:
     Option A: Use optimization (scipy.optimize) to find health metrics that minimize difference from target blood sugar
     Option B: Train inverse model (predict health metrics from blood sugar)
     Option C: Use rule-based recommendations based on correlations
   - Consider constraints (e.g., sleep hours 0-24, steps >= 0)
   - Return recommended ranges for each metric
   - Include confidence scores or uncertainty estimates

4. Create `backend/app/ml/training/train_user_specific.py`:
   - Function to train user-specific models (if user has enough data)
   - Minimum threshold: require at least 20-30 readings before training user-specific model
   - Fallback to global model if insufficient data

5. Add model retraining pipeline:
   - Create `backend/app/ml/training/retrain.py`:
     - Function to retrain models with latest data
     - Compare new model performance with existing model
     - Only replace if new model performs better
     - Keep backup of previous model

6. Create `backend/app/ml/models/model_metadata.py`:
   - Pydantic models for model metadata
   - Store: version, training_date, performance_metrics, feature_list, model_type
   - Save metadata as JSON alongside model files
```

---

## Phase 6: ML API Endpoints

**Prompt:**
```
I need to create FastAPI endpoints for machine learning predictions and recommendations. These endpoints should allow users to get blood sugar predictions and receive personalized recommendations.

Please implement:

1. Create `backend/app/api/ml.py` router with the following endpoints:

   a) POST `/api/ml/predict`:
      - Request body: { step_count, sleep_hours, calorie_count, protein_intake_g, carb_intake_g, exercise_minutes }
      - Response: { predicted_blood_sugar, confidence_interval (optional) }
      - Use current user's model if available, otherwise use global model
      - Include error handling for missing/invalid inputs

   b) POST `/api/ml/recommendations`:
      - Request body: { target_blood_sugar, current_metrics (optional) }
      - Response: { 
          recommended_step_count, 
          recommended_sleep_hours, 
          recommended_calorie_count,
          recommended_protein_intake_g,
          recommended_carb_intake_g,
          recommended_exercise_minutes,
          confidence_score
        }
      - Consider current user's metrics as baseline
      - Return ranges or specific values

   c) GET `/api/ml/model-info`:
      - Response: { 
          model_version, 
          training_date, 
          performance_metrics, 
          is_user_specific,
          data_points_used
        }
      - Return info for current user's model or global model

   d) POST `/api/ml/retrain` (Admin only):
      - Trigger model retraining
      - Response: { status, message, new_performance_metrics }
      - Should check if user has admin role
      - Run training in background (use background tasks)

2. Create Pydantic schemas in `backend/app/schemas/ml.py`:
   - PredictionRequest
   - PredictionResponse
   - RecommendationRequest
   - RecommendationResponse
   - ModelInfoResponse

3. Register the ML router in `backend/app/main.py`:
   - Add router with prefix `/api` and tags=["ML"]

4. Add proper error handling:
   - Handle cases where model doesn't exist
   - Handle insufficient training data
   - Return meaningful error messages

5. Add authentication/authorization:
   - All endpoints require authentication (use get_current_user)
   - Retrain endpoint requires admin role
```

---

## Phase 7: Visualization Infrastructure

**Prompt:**
```
I need to add data visualization capabilities to the frontend to help users understand their health metrics and blood sugar trends over time.

Please implement:

1. Install visualization library in frontend:
   - Add `recharts` to `frontend/package.json` (or chart.js/victory as alternative)
   - Run npm install

2. Create `frontend/src/components/visualizations/` directory

3. Create `frontend/src/components/visualizations/HealthMetricsChart.jsx`:
   - Component that displays time series of all health metrics
   - Use line chart or area chart
   - Show multiple metrics on same chart with different colors
   - Include date range selector
   - Make it responsive

4. Create `frontend/src/components/visualizations/BloodSugarTrend.jsx`:
   - Component showing blood sugar over time
   - Color-code readings (green for normal, yellow for elevated, red for high)
   - Show correlation indicators with health metrics
   - Include trend line
   - Add markers for significant events

5. Create `frontend/src/components/visualizations/CorrelationMatrix.jsx`:
   - Heatmap showing correlation between health metrics and blood sugar
   - Use color intensity to show correlation strength
   - Include correlation coefficients
   - Make it interactive (hover to see exact values)

6. Create `frontend/src/components/visualizations/RecommendationsDisplay.jsx`:
   - Visual display of ML recommendations
   - Show current values vs recommended values
   - Use progress bars or gauges
   - Color-code based on how close user is to recommendations
   - Include confidence indicators

7. Integrate visualizations into ReadingsDashboard:
   - Add a new section or tab for visualizations
   - Allow users to toggle between table view and chart view
   - Make visualizations load data from the readings API

8. Add styling for visualizations in `frontend/src/App.css`:
   - Ensure charts are responsive
   - Match existing design system colors
   - Add loading states for charts
```

---

## Phase 8: Recommendations UI

**Prompt:**
```
I need to create a user interface for displaying ML-powered recommendations to help users achieve their target blood sugar levels.

Please implement:

1. Create `frontend/src/components/recommendations/RecommendationsPanel.jsx`:
   - Component that displays personalized recommendations
   - Input: Allow user to set target blood sugar range (min/max)
   - Display recommended daily targets for each metric:
     - Steps, Sleep, Exercise, Calories, Protein, Carbs
   - Show current values vs recommended values
   - Include confidence intervals or ranges
   - Add "Get Recommendations" button that calls ML API

2. Create `frontend/src/components/recommendations/RecommendationCard.jsx`:
   - Reusable card component for each recommendation
   - Shows metric name, current value, recommended value
   - Visual indicator (progress bar) showing how close user is to target
   - Color coding: green (on target), yellow (close), red (far from target)

3. Integrate RecommendationsPanel into ReadingsDashboard:
   - Add as a new section or sidebar
   - Position it prominently for easy access
   - Make it collapsible/expandable

4. Add API integration:
   - Create function in `frontend/src/config/api.js` to call ML recommendations endpoint
   - Handle loading and error states
   - Cache recommendations (optional)

5. Add form for target blood sugar input:
   - Allow user to set their target range
   - Validate input (min < max, reasonable ranges)
   - Save user preferences (optional, could use localStorage)

6. Display recommendations with visual elements:
   - Progress bars showing current vs recommended
   - Icons for each metric type
   - Tooltips explaining why each recommendation matters
   - "Apply to next reading" quick action (optional)

7. Add styling in `frontend/src/App.css`:
   - Style recommendation cards
   - Match existing design system
   - Make it mobile-responsive
```

---

## Phase 9: Data Analysis and Insights

**Prompt:**
```
I need to add analytics and insights endpoints to help users understand patterns in their health data and blood sugar readings.

Please implement:

1. Create `backend/app/api/analytics.py` router with endpoints:

   a) GET `/api/analytics/summary`:
      - Calculate aggregate statistics for current user
      - Return: {
          avg_blood_sugar, min_blood_sugar, max_blood_sugar,
          avg_steps, avg_sleep, avg_exercise,
          avg_calories, avg_protein, avg_carbs,
          total_readings, date_range
        }
      - Support optional date range filtering

   b) GET `/api/analytics/correlations`:
      - Calculate correlation coefficients between each health metric and blood sugar
      - Return: {
          step_count_correlation,
          sleep_hours_correlation,
          exercise_minutes_correlation,
          calorie_count_correlation,
          protein_intake_correlation,
          carb_intake_correlation
        }
      - Use pandas or numpy for correlation calculation
      - Handle cases with insufficient data

   c) GET `/api/analytics/trends`:
      - Analyze trends over time periods (daily, weekly, monthly)
      - Return: {
          period, avg_blood_sugar, trend_direction (up/down/stable),
          significant_changes
        }
      - Support grouping by reading_type

   d) GET `/api/analytics/patterns`:
      - Identify patterns (e.g., blood sugar higher after high carb meals)
      - Return common patterns found in user's data
      - Use simple rule-based analysis or basic ML clustering

2. Create Pydantic schemas in `backend/app/schemas/analytics.py`:
   - SummaryResponse
   - CorrelationsResponse
   - TrendsResponse
   - PatternsResponse

3. Register analytics router in `backend/app/main.py`:
   - Add with prefix `/api` and tags=["Analytics"]

4. Create `frontend/src/components/analytics/AnalyticsDashboard.jsx`:
   - Component to display all analytics and insights
   - Show summary cards with key metrics
   - Display correlation matrix visualization
   - Show trend charts
   - Display identified patterns

5. Add route for analytics dashboard:
   - Create new page/route for analytics (if using routing)
   - Or add as section in ReadingsDashboard

6. Style analytics components:
   - Create cards for summary statistics
   - Use color coding for trends (green for good, red for concerning)
   - Make it visually appealing and easy to understand
```

---

## Phase 10: Testing and Validation

**Prompt:**
```
I need to add comprehensive testing for the ML features, API endpoints, and frontend components to ensure everything works correctly.

Please implement:

1. Backend ML Tests (`backend/tests/test_ml.py`):
   - Test model training with sample data
   - Test prediction function with valid inputs
   - Test prediction with missing/invalid inputs
   - Test recommendation generation
   - Test model loading and saving
   - Test data export function
   - Use pytest fixtures for test data

2. Backend API Tests (`backend/tests/test_ml_api.py`):
   - Test POST /api/ml/predict endpoint
   - Test POST /api/ml/recommendations endpoint
   - Test GET /api/ml/model-info endpoint
   - Test POST /api/ml/retrain (admin only)
   - Test error cases (missing model, invalid inputs)
   - Test authentication/authorization

3. Backend Analytics Tests (`backend/tests/test_analytics.py`):
   - Test GET /api/analytics/summary
   - Test GET /api/analytics/correlations
   - Test GET /api/analytics/trends
   - Test with various data scenarios (empty, single reading, many readings)

4. Frontend Component Tests:
   - Test RecommendationsPanel component
   - Test visualization components render correctly
   - Test form validation for health metrics
   - Test API integration in components

5. Integration Tests:
   - Test full flow: create reading with metrics → train model → get prediction
   - Test recommendation flow end-to-end
   - Test analytics with real data patterns

6. Model Validation:
   - Create test dataset for model evaluation
   - Validate model predictions are within reasonable ranges
   - Test edge cases (extreme values, missing features)

7. Add test data fixtures:
   - Create sample readings with health metrics
   - Create test users
   - Helper functions to generate test data

8. Update test configuration:
   - Ensure pytest is in requirements-dev.txt
   - Add test coverage reporting (optional)
   - Configure test database (separate from production)
```

---

## Phase 11: Documentation and Deployment

**Prompt:**
```
I need to document the ML features and prepare for deployment, including model persistence, configuration, and user documentation.

Please implement:

1. Model Persistence Strategy:
   - Decide on storage: local files, S3, or database
   - Create `backend/app/core/ml_config.py`:
     - Configuration for model paths
     - Environment variables for model storage location
     - Settings for model retraining schedule

2. Environment Variables:
   - Add to `.env.example`:
     - ML_MODEL_PATH
     - ML_MODEL_STORAGE_TYPE (local/s3)
     - S3_MODEL_BUCKET (if using S3)
     - ML_RETRAIN_SCHEDULE (cron expression)

3. Update `backend/app/core/config.py`:
   - Add ML-related configuration settings
   - Load from environment variables

4. Model Versioning:
   - Implement model version tracking
   - Store model metadata in database or JSON files
   - Add migration to create model_versions table (optional)

5. Documentation:
   - Create `backend/app/ml/README.md`:
     - Explain model architecture
     - Document training process
     - How to retrain models
     - Model performance expectations

   - Update main `README.md`:
     - Add ML features section
     - Document new API endpoints
     - Add setup instructions for ML dependencies

   - Add API documentation:
     - Ensure FastAPI auto-docs show ML endpoints
     - Add detailed descriptions to endpoint docstrings

6. Deployment Considerations:
   - Add model files to .gitignore if large
   - Create script to download/initialize models on first deploy
   - Add health check for ML models (verify they exist and load)
   - Consider model size in Docker image

7. Scheduled Retraining:
   - Add scheduled job (using APScheduler) to retrain models periodically
   - Configure in `backend/app/main.py` or separate scheduler module
   - Log retraining results

8. Error Handling and Monitoring:
   - Add logging for ML operations
   - Log prediction requests and results (anonymized)
   - Add monitoring for model performance degradation
   - Alert if model fails to load

9. User Documentation:
   - Update frontend README with new features
   - Add tooltips/help text in UI explaining ML features
   - Create user guide for recommendations feature

10. Backup Strategy:
    - Include model files in backup process
    - Version control for model metadata
    - Document model rollback procedure
```

---

## Usage Instructions

To use these prompts:

1. Copy the prompt for the phase you want to implement
2. Paste it into Cursor/your AI assistant
3. The assistant will implement the features described
4. Review and test the implementation
5. Move to the next phase

**Note:** Some phases may require running the previous phases first (e.g., Phase 6 needs Phase 4 and 5 completed). Always check dependencies before starting a new phase.

