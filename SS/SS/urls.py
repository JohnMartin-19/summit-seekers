# SS/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token # If you want a basic token endpoint

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('expeditions.urls')), # Include your API URLs
    # Optional: Django Rest Framework's browsable API login/logout
    path('api-auth/', include('rest_framework.urls')),
    # Optional: Direct token creation endpoint
    path('api/token-auth/', obtain_auth_token),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)