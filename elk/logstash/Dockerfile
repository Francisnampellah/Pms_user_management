FROM docker.elastic.co/logstash/logstash:8.11.0

# Remove default pipeline
RUN rm -f /usr/share/logstash/pipeline/logstash.conf

# Copy custom configuration
COPY config/logstash.yml /usr/share/logstash/config/logstash.yml
COPY pipeline/logstash.conf /usr/share/logstash/pipeline/logstash.conf
