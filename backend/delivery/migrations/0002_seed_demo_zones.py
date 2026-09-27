from django.db import migrations

# Demo defaults so checkout works on a fresh database. These are test
# values only - the real fees are meant to be maintained in Django Admin
# under Delivery > Delivery zones, which is why they live in a migration
# you can revert rather than in the code path.
DEMO_ZONES = [
    {
        "name": "Biratnagar Delivery",
        "province": "Koshi Province",
        "district": "Morang",
        "municipality": "Biratnagar",
        "delivery_fee": "50",
        "estimated_delivery_days": 1,
        "minimum_order_amount": "0",
    },
    {
        "name": "Itahari Delivery",
        "province": "Koshi Province",
        "district": "Sunsari",
        "municipality": "Itahari",
        "delivery_fee": "80",
        "estimated_delivery_days": 1,
        "minimum_order_amount": "0",
    },
    {
        "name": "Damak Delivery",
        "province": "Koshi Province",
        "district": "Jhapa",
        "municipality": "Damak",
        "delivery_fee": "100",
        "estimated_delivery_days": 2,
        "minimum_order_amount": "0",
    },
]


def create_demo_zones(apps, schema_editor):
    DeliveryZone = apps.get_model("delivery", "DeliveryZone")

    for zone in DEMO_ZONES:
        DeliveryZone.objects.get_or_create(
            province=zone["province"],
            district=zone["district"],
            municipality=zone["municipality"],
            defaults=zone,
        )


def remove_demo_zones(apps, schema_editor):
    DeliveryZone = apps.get_model("delivery", "DeliveryZone")

    for zone in DEMO_ZONES:
        DeliveryZone.objects.filter(
            name=zone["name"]
        ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("delivery", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            create_demo_zones,
            remove_demo_zones,
        ),
    ]
